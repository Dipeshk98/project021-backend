import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import type { I9UserRepository } from '@/repositories/I9UserRepository';
import type { TeamService } from '@/services/TeamService';
import type { EmailService } from '@/services/EmailService';
import type {
  ParamsEmailHandler,
} from '@/validations/UserValidation';

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
      // Extract the necessary fields from the request body
      const {
        id,
        status,
        userId,
        username,
        firstName,
        lastName,
        gender,
        email,
        manager,
        hr,
        timezone,
        mi,
        department,
        jobCode,
        division,
        location,
        hireDate,
        empId,
        title,
        bizPhone,
        fax,
        addr1,
        addr2,
        city,
        state,
        zip,
        country,
        reviewFreq,
        lastReviewDate,
        customFields,
        matrixManager,
        defaultLocale,
        proxy,
      } = req.body;
  
      // Create a new user in the database
      const newUser = await this.userRepository.create({
        id,
        status,
        userId,
        username,
        firstName,
        lastName,
        gender,
        email,
        manager,
        hr,
        timezone,
        mi,
        department,
        jobCode,
        division,
        location,
        hireDate,
        empId,
        title,
        bizPhone,
        fax,
        addr1,
        addr2,
        city,
        state,
        zip,
        country,
        reviewFreq,
        lastReviewDate,
        customFields,
        matrixManager,
        defaultLocale,
        proxy,
      });
  
      // Return the newly created user
      res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};
  
  public getUserById: ParamsEmailHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await this.userRepository.findById(id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user' });
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
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update user' });
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
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };
  public getAllUsers = async (req, res) => {
    try {
      // Fetch all users from the database
      const users = await this.userRepository.findAll();
  
      // Respond with the list of users
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }; 
}
