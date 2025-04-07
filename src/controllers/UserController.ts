import type { I9UserRepository } from '@/repositories/I9UserRepository';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import type { EmailService } from '@/services/EmailService';
import type { TeamService } from '@/services/TeamService';
import type { ParamsEmailHandler } from '@/validations/UserValidation';

export class UserController {
  private userRepository: UserRepository;

  private emailService: EmailService;

  private i9UserRepository: I9UserRepository;

  constructor(
    teamService: TeamService,
    userRepository: UserRepository,
    teamRepository: TeamRepository,
    i9UserRepository: I9UserRepository,
    emailService: EmailService
  ) {
    this.userRepository = userRepository;
    this.emailService = emailService;
    this.i9UserRepository = i9UserRepository;
  }

  public createUser = async (req, res) => {
    try {
      const userData = req.body;
  
      // Check for required fields based on Prisma schema
      const requiredFields = ['status', 'userId', 'firstName', 'lastName'];
      const missingFields = requiredFields.filter(field => !userData[field]);
  
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `The following required fields are missing: ${missingFields.join(', ')}`
        });
      }
  
      // Create a new user with the provided data
      await this.userRepository.create(userData);
  
      // Return success response
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('User creation error:', error);
      
      // Provide more user-friendly error messages for common issues
      if (error.name === 'PrismaClientValidationError') {
        return res.status(400).json({ 
          error: 'Validation Error', 
          message: 'Missing required fields in the request',
          details: error.message
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to create user', 
        message: 'An error occurred while creating the user',
        details: error.message 
      });
    }
  };

  public getUserById: ParamsEmailHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      // console.error(error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  public updateUserById = async (req, res) => {
    try {
      const { id } = req.params; // Extract the user's unique identifier from the route parameters
      const updateData = req.body; // Extract the updated fields from the request body

      // Check if the user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update the user
      const updatedUser = await this.userRepository.updateById(id, updateData);

      // Respond with the updated user
      return res.json(updatedUser);
    } catch (error) {
      // console.error(error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  };

  public deleteUserById = async (req, res) => {
    try {
      const { id } = req.params; // Extract the user's unique identifier from the route parameters

      // Check if the user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete the user
      await this.userRepository.deleteById(id);

      // Respond with a success message
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      // console.error(error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  };

  public getAllUsers = async (req, res) => {
    try {
      // Fetch all users from the database
      const users = await this.userRepository.findAll();

      // Respond with the list of users
      res.json(users);
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
}
