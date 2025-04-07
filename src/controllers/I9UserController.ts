import type { I9DocumentRepository } from '@/repositories/i9DocumentRepository';
import type { I9EmployerRepository } from '@/repositories/I9EmployerRepository';
import type { I9FormRepository } from '@/repositories/I9FormRepository';
import type { I9ReverificationRepository } from '@/repositories/I9ReverificationRepository';
import type { I9UserRepository } from '@/repositories/I9UserRepository';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import type { EmailService } from '@/services/EmailService';
import type { TeamService } from '@/services/TeamService';

export class I9UserController {
  private userRepository: UserRepository;

  private emailService: EmailService;

  private i9UserRepository: I9UserRepository;

  private i9DocumentRepository: I9DocumentRepository;

  private i9EmployerRepository: I9EmployerRepository;

  private i9FormRepository: I9FormRepository;

  private i9ReverificationRepository: I9ReverificationRepository;

  constructor(
    teamService: TeamService,
    userRepository: UserRepository,
    teamRepository: TeamRepository,
    i9UserRepository: I9UserRepository,
    emailService: EmailService,
    i9DocumentRepository: I9DocumentRepository,
    i9EmployerRepository: I9EmployerRepository,
    i9FormRepository: I9FormRepository,
    i9ReverificationRepository: I9ReverificationRepository
  ) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.i9UserRepository = i9UserRepository;
    this.i9DocumentRepository = i9DocumentRepository;
    this.i9EmployerRepository = i9EmployerRepository;
    this.i9FormRepository = i9FormRepository;
    this.i9ReverificationRepository = i9ReverificationRepository;
  }

  public sendI9Email = async (req, res) => {
    try {
      const { id } = req.params; // Extract user ID from the URL

      // Fetch user details from the I9Users table
      const user = await this.i9UserRepository.findI9UserById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Construct default email content
      const subject = 'I-9 Verification Process';
      const message = `Hello ${user.first_name},\n\nPlease complete your I-9 verification process as soon as possible.\n\nRegards,\nHR Team`;

      // Send email using EmailService
      await this.emailService.sendEmail({
        to: user.email,
        subject,
        body: message,
      });

      return res.json({
        success: true,
        message: `Email sent to ${user.email}`,
      }); // ✅ Explicit return
    } catch (error) {
      // // console.error(error);
      return res.status(500).json({ error: 'Failed to send email' }); // ✅ Explicit return
    }
  };

  public createI9User = async (req, res) => {
    try {
      const requestingUser = (req as any).user;
      console.log('Request made by:', requestingUser?.sub || requestingUser?.email || requestingUser?.['cognito:username'] || 'unknown');
      
      // Extract all possible fields from request body
      const {
        first_name,
        last_name,
        middle_initial,
        other_last_names,
        email,
        phone_number,
        address_street,
        address_apt,
        city,
        state,
        zip_code,
        date_of_birth,
        ssn,
        citizenship_status,
        alien_registration_number,
        work_authorization_expiry,
        uscis_a_number,
        i94_admission_number,
        foreign_passport_number,
        country_of_issuance,
        employee_signature,
        signed_date,
        prepartor,
        work_start_date,
      } = req.body;
  
      // Minimal validation - only email is required since it's a unique field
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      // Check if user already exists by email
      const existingUser = await this.i9UserRepository.findI9UserByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ error: 'User with this email already exists' });
      }
  
      // Create user object with all available fields
      const userData = {
        first_name: first_name || '',
        last_name: last_name || '',
        middle_initial,
        other_last_names,
        email,
        phone_number,
        address_street,
        address_apt,
        city,
        state,
        zip_code,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        ssn,
        citizenship_status,
        alien_registration_number,
        work_authorization_expiry: work_authorization_expiry
          ? new Date(work_authorization_expiry)
          : null,
        uscis_a_number,
        i94_admission_number,
        foreign_passport_number,
        country_of_issuance,
        employee_signature,
        signed_date: signed_date ? new Date(signed_date) : null,
        prepartor,
        work_start_date: work_start_date ? new Date(work_start_date) : null,
      };
  
      // Create new I-9 user record
      const newUser = await this.i9UserRepository.create(userData);
  
      return res.status(201).json({
        success: true,
        message: 'I-9 user created successfully',
        user: newUser,
      });
    } catch (error) {
      console.error('Error creating I-9 user:', error);
      
      // Check for specific database errors
      if (error.code === 'P2002') {
        // Prisma unique constraint violation
        const field = error.meta?.target[0] || 'field';
        return res.status(400).json({ error: `A user with this ${field} already exists` });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  public createI9Document = async (req, res) => {
    try {
      const {
        form_id,
        document_title,
        document_type,
        document_number,
        document_expiry,
        issuing_authority,
        uploaded_file,
      } = req.body;

      // Validate required fields
      if (
        !form_id ||
        !document_title ||
        !document_type ||
        !issuing_authority ||
        !uploaded_file
      ) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create new document in DB
      const newDocument = await this.i9DocumentRepository.create({
        form_id,
        document_title,
        document_type,
        document_number,
        document_expiry: document_expiry ? new Date(document_expiry) : null,
        issuing_authority,
        uploaded_file,
      });

      return res.status(201).json({
        message: 'I-9 Document created successfully',
        document: newDocument,
      });
    } catch (error) {
      // console.error(error);
      return res.status(500).json({ error: 'Failed to create I-9 document' });
    }
  };

  public createI9EmployerSection = async (req, res) => {
    try {
      const {
        form_id,
        employer_name,
        employer_address,
        title,
        signature,
        signed_date,
        first_day_of_employment,
      } = req.body;

      // Convert string dates to Date objects
      const parsedSignedDate = signed_date ? new Date(signed_date) : null;
      const parsedFirstDayOfEmployment = first_day_of_employment
        ? new Date(first_day_of_employment)
        : null;

      // Check if the form exists before adding employer section
      const formExists = await this.i9FormRepository.findI9FormById(form_id);
      if (!formExists) {
        return res
          .status(400)
          .json({ error: 'Invalid form_id. Form does not exist.' });
      }

      // Check if the employer section already exists for this form
      const existingEmployerSection =
        await this.i9EmployerRepository.findEmployerSectionByFormId(form_id);
      if (existingEmployerSection) {
        return res
          .status(400)
          .json({ error: 'Employer section already exists for this form.' });
      }

      // ✅ Use the correct method for creating employer section
      const employerSection =
        await this.i9EmployerRepository.createEmployerSection({
          form_id,
          employer_name,
          employer_address,
          title,
          signature,
          signed_date: parsedSignedDate,
          first_day_of_employment: parsedFirstDayOfEmployment,
        });

      return res.status(201).json({
        message: 'Employer Section created successfully',
        data: employerSection,
      });
    } catch (error) {
      // console.error('Error in createI9EmployerSection:', error);
      return res
        .status(500)
        .json({ error: 'Failed to create employer section' });
    }
  };

  public createI9Reverification = async (req, res) => {
    try {
      const {
        form_id,
        rehire_date,
        new_last_name,
        new_first_name,
        new_middle_initial,
        reverification_document_title,
        reverification_document_number,
        reverification_document_expiry,
        employer_name,
        employer_signature,
        employer_signed_date,
        additional_information,
        used_dhs_alternative,
      } = req.body;

      // Convert string dates to Date objects
      const parsedRehireDate = rehire_date ? new Date(rehire_date) : null;
      const parsedReverificationExpiry = reverification_document_expiry
        ? new Date(reverification_document_expiry)
        : null;
      const parsedEmployerSignedDate = employer_signed_date
        ? new Date(employer_signed_date)
        : null;

      // Check if the form exists before adding a reverification entry
      const formExists = await this.i9FormRepository.findI9FormById(form_id);
      if (!formExists) {
        return res
          .status(400)
          .json({ error: 'Invalid form_id. Form does not exist.' });
      }

      // Check if the reverification entry already exists for this form
      const existingReverification =
        await this.i9ReverificationRepository.findReverificationByFormId(
          form_id
        );
      if (existingReverification) {
        return res.status(400).json({
          error: 'Reverification entry already exists for this form.',
        });
      }

      // Save reverification details
      const reverificationEntry =
        await this.i9ReverificationRepository.createReverification({
          form_id,
          rehire_date: parsedRehireDate,
          new_last_name,
          new_first_name,
          new_middle_initial,
          reverification_document_title,
          reverification_document_number,
          reverification_document_expiry: parsedReverificationExpiry,
          employer_name,
          employer_signature,
          employer_signed_date: parsedEmployerSignedDate,
          additional_information,
          used_dhs_alternative,
        });

      return res.status(201).json({
        message: 'Reverification created successfully',
        data: reverificationEntry,
      });
    } catch (error) {
      // console.error('Error in createI9Reverification:', error);
      return res
        .status(500)
        .json({ error: 'Failed to create reverification entry' });
    }
  };

  public getAllI9Users = async (req, res) => {
    try {
      // Implement pagination if needed
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const skip = (page - 1) * limit;
  
      // Get total count for pagination
      const totalCount = await this.i9UserRepository.count();
      
      // Fetch users with pagination
      const users = await this.i9UserRepository.findAll({
        skip,
        take: limit,
      });
  
      return res.json({
        success: true,
        data: users,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      // console.error('Error fetching I-9 users:', error);
      return res.status(500).json({ error: 'Failed to fetch I-9 users' });
    }
  };
}
