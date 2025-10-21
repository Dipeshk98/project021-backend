import {
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import type { InitiationMetadataRepository } from "@/repositories/InitiationMetadataRepository";

const prisma = new PrismaClient();
const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-west-1",
});
const sesClient = new SESClient({ region: "us-west-1" });

// Function to generate a strong password meeting Cognito requirements
function generateStrongPassword(): string {
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const numbers = "0123456789";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";

  // Ensure at least one of each required character type
  let password = "";
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];

  // Fill the rest with random characters
  const allChars = specialChars + numbers + upperCase + lowerCase;
  for (let i = password.length; i < 10; i += 1) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Function to format phone number
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If the number starts with a country code (e.g., 1 for US), keep it
  // Otherwise, assume it's a US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
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
        verification_type,
      } = req.body;

      // Get the authenticated user (HR) from the request
      const hrUser = (req as any).user;
      if (!hrUser || !hrUser.sub) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Generate a strong password for Cognito
      const tempPassword = generateStrongPassword();

      // Format phone number
      const formattedPhone = formatPhoneNumber(phone_no);

      let cognitoUserId = email;
      let userAlreadyExists = false;

      // Check if user exists in Cognito first
      try {
        await cognitoClient.send(
          new AdminGetUserCommand({
            UserPoolId: "us-west-1_PoRjnQjbm",
            Username: email,
          })
        );

        // User already exists in Cognito
        userAlreadyExists = true;
      } catch (error: any) {
        if (error.name === "UserNotFoundException") {
          // User doesn't exist, we'll create them
          // User does not exist in Cognito, will create
        } else {
          // Some other error occurred
          throw error;
        }
      }

      // Only create user if they don't exist
      if (!userAlreadyExists) {
        try {
          // Create user in Cognito
          const cognitoUser = await cognitoClient.send(
            new AdminCreateUserCommand({
              UserPoolId: "us-west-1_PoRjnQjbm",
              Username: email,
              TemporaryPassword: tempPassword,
              UserAttributes: [
                { Name: "email", Value: email },
                { Name: "email_verified", Value: "true" },
                { Name: "given_name", Value: first_name },
                { Name: "family_name", Value: last_name },
                { Name: "phone_number", Value: formattedPhone },
              ],
              MessageAction: "SUPPRESS",
            })
          );

          cognitoUserId = cognitoUser.User?.Username || email;

          // Set permanent password
          await cognitoClient.send(
            new AdminSetUserPasswordCommand({
              UserPoolId: "us-west-1_PoRjnQjbm",
              Username: email,
              Password: tempPassword,
              Permanent: true,
            })
          );

          // Successfully created Cognito user
        } catch (error: any) {
          // If user creation fails because user exists, that's okay
          if (error.name === "UsernameExistsException") {
            // User already exists (caught during creation)
            userAlreadyExists = true;
          } else {
            throw error;
          }
        }
      }

      // Check if user exists in local database (check by both id AND email)
      let localUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: cognitoUserId }, { email }],
        },
      });

      // Create user in local database if they don't exist
      if (!localUser) {
        try {
          localUser = await prisma.user.create({
            data: {
              id: cognitoUserId,
              email,
            },
          });
          // Created user in local database
        } catch (dbError: any) {
          // If user creation fails due to unique constraint, try to find them
          if (dbError.code === "P2002") {
            // User already exists in database (unique constraint), fetching existing user
            localUser = await prisma.user.findFirst({
              where: {
                OR: [{ id: cognitoUserId }, { email }],
              },
            });
          } else {
            throw dbError;
          }
        }
      } else {
        // User already exists in local database
      }

      // Create form in I9Forms
      const formId = uuidv4();
      const form = await prisma.i9Forms.create({
        data: {
          form_id: formId,
          employee_id: localUser!.id,
          status: "INITIATED",
          start_date: new Date(hire_date),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create initiation metadata
      const initiationMetadata = await this.initiationMetadataRepository.create(
        {
          initiation_id: uuidv4(),
          form_id: formId,
          initiated_by: hrUser.sub,
          initiation_method: "MANUAL",
          first_name,
          last_name,
          email,
          phone_no: formattedPhone,
          verification_type,
          created_at: new Date(),
        }
      );

      // Send email using SES (only if user was newly created)
      if (!userAlreadyExists) {
        try {
          const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:3000";
          const loginUrl = `${frontendUrl}/login/`;

          await sesClient.send(
            new SendEmailCommand({
              Source:
                process.env.SENDER_EMAIL_ADDRESS || "dipesh6198@gmail.com",
              Destination: {
                ToAddresses: [email],
              },
              Message: {
                Subject: {
                  Data: "Your Login Credentials",
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
                  `,
                  },
                },
              },
            })
          );
          // Sent credentials email
        } catch (emailError) {
          // Failed to send email, but continuing
          // Don't fail the whole request if email fails
        }
      } else {
        // Skipping email send - user already exists
      }

      return res.status(201).json({
        success: true,
        message: "Initiation created successfully",
        data: {
          initiationMetadata,
          form,
          userAlreadyExists,
        },
      });
    } catch (error) {
      // Error in createInitiation
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public getInitiation = async (req: Request, res: Response) => {
    try {
      const { form_id } = req.params;

      if (!form_id) {
        return res.status(400).json({
          success: false,
          message: "Form ID is required",
        });
      }

      const initiationMetadata =
        await this.initiationMetadataRepository.findByFormId(form_id);

      if (!initiationMetadata) {
        return res.status(404).json({
          success: false,
          message: "Initiation metadata not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          first_name: initiationMetadata.first_name,
          last_name: initiationMetadata.last_name,
          email: initiationMetadata.email,
          phone_no: initiationMetadata.phone_no,
        },
      });
    } catch (error) {
      // Error in getInitiation
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  public static getUserFormId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      // Get the authenticated user from the request
      const { user } = req as any;
      if (!user || !user.sub) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Find the most recent form for the user
      const form = await prisma.i9Forms.findFirst({
        where: {
          employee_id: user.sub,
        },
        orderBy: {
          created_at: "desc",
        },
        select: {
          form_id: true,
        },
      });

      if (!form) {
        res.status(404).json({
          success: false,
          message: "No form found for this user",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          form_id: form.form_id,
        },
      });
    } catch (error) {
      // Error in getUserFormId
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
