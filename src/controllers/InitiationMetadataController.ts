import { Request, Response } from 'express';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { v4 as uuidv4 } from 'uuid';
import { InitiationMetadataRepository } from '@/repositories/InitiationMetadataRepository';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-west-1' });
const sesClient = new SESClient({ region: 'us-west-1' });

// Function to generate a strong password meeting Cognito requirements
function generateStrongPassword(): string {
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const numbers = '0123456789';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  
  // Ensure at least one of each required character type
  let password = '';
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  
  // Fill the rest with random characters
  const allChars = specialChars + numbers + upperCase + lowerCase;
  for (let i = password.length; i < 10; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Function to format phone number
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If the number starts with a country code (e.g., 1 for US), keep it
  // Otherwise, assume it's a US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export class InitiationMetadataController {
  private initiationMetadataRepository: InitiationMetadataRepository;

  constructor(initiationMetadataRepository: InitiationMetadataRepository) {
    this.initiationMetadataRepository = initiationMetadataRepository;
  }

  public createInitiation = async (req: Request, res: Response) => {
    try {
      const {
        first_name,
        last_name,
        email,
        phone_no,
        hire_date,
        verification_type
      } = req.body;

      // Get the authenticated user (HR) from the request
      const hrUser = (req as any).user;
      if (!hrUser || !hrUser.sub) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Generate a strong password for Cognito
      const tempPassword = generateStrongPassword();

      // Format phone number
      const formattedPhone = formatPhoneNumber(phone_no);

      // Create user in Cognito
      const cognitoUser = await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: 'us-west-1_PoRjnQjbm',
        Username: email,
        TemporaryPassword: tempPassword,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'given_name', Value: first_name },
          { Name: 'family_name', Value: last_name },
          { Name: 'phone_number', Value: formattedPhone }
        ],
        MessageAction: 'SUPPRESS'
      }));

      // Set permanent password
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: 'us-west-1_PoRjnQjbm',
        Username: email,
        Password: tempPassword,
        Permanent: true
      }));

      // Create user in local database (User table)
      await prisma.user.create({
        data: {
          id: cognitoUser.User?.Username || email,
          email: email,
          // Add other fields as needed (e.g., first_name, last_name, etc.)
        }
      });

      // Create form in I9Forms
      const formId = uuidv4();
      const form = await prisma.i9Forms.create({
        data: {
          form_id: formId,
          employee_id: cognitoUser.User?.Username || '',
          status: 'INITIATED',
          start_date: new Date(hire_date),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Create initiation metadata
      const initiationMetadata = await this.initiationMetadataRepository.create({
        initiation_id: uuidv4(),
        form_id: formId,
        initiated_by: hrUser.sub,
        initiation_method: 'MANUAL',
        first_name,
        last_name,
        email,
        phone_no: formattedPhone,
        verification_type,
        created_at: new Date()
      });

      // Send email using SES
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const loginUrl = `${frontendUrl}/login/`;

      await sesClient.send(new SendEmailCommand({
        Source: 'souravaws@safespacelabs.com', // Replace with your verified SES email
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Subject: {
            Data: 'Your Login Credentials'
          },
          Body: {
            Html: {
              Data: `
                <h1>Welcome to I-9 Form System</h1>
                <p>Your login credentials are:</p>
                <p>Login URL: <a href="${loginUrl}">${loginUrl}</a></p>
                <p>Email: ${email}</p>
                <p>Password: ${tempPassword}</p>
                <p>Please change your password after first login.</p>
              `
            }
          }
        }
      }));

      return res.status(201).json({
        success: true,
        message: 'Initiation created successfully',
        data: {
          initiationMetadata,
          form
        }
      });

    } catch (error) {
      console.error('Error in createInitiation:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
} 