import type { I9UserRepository } from '@/repositories/I9UserRepository';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import type { EmailService } from '@/services/EmailService';
import type { TeamService } from '@/services/TeamService';
import type { ParamsEmailHandler } from '@/validations/UserValidation';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  public createUser = async (req: Request, res: Response) => {
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
    } catch (error: unknown) {
      console.error('User creation error:', error);
      
      // Provide more user-friendly error messages for common issues
      if (error instanceof Error && error.name === 'PrismaClientValidationError') {
        return res.status(400).json({ 
          error: 'Validation Error', 
          message: 'Missing required fields in the request',
          details: error.message
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to create user', 
        message: 'An error occurred while creating the user',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getUserById: ParamsEmailHandler = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  public updateUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      const updateData = req.body;

      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await this.userRepository.updateById(id, updateData);

      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  };

  public deleteUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      await this.userRepository.deleteById(id);

      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  };

  public getAllUsers = async (req: Request, res: Response) => {
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

  public registerUserFromCognito = async (req: Request, res: Response) => {
    try {
      const { cognitoUsername, email } = req.body;

      if (!cognitoUsername || !email) {
        return res.status(400).json({
          success: false,
          message: 'Cognito username and email are required'
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          id: cognitoUsername
        }
      });

      if (existingUser) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
          data: existingUser
        });
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          id: cognitoUsername,
          email: email
        }
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: newUser
      });
    } catch (error) {
      console.error('Error in registerUserFromCognito:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  public getUserPermissions = async (req: Request, res: Response) => {
    try {
      const authenticatedUser = (req as any).user;
      if (!authenticatedUser || !authenticatedUser.sub) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = authenticatedUser.sub;

      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get all permissions for the user through the relationship chain
      const userPermissions = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          userGroups: {
            select: {
              group: {
                select: {
                  groupRoles: {
                    select: {
                      role: {
                        select: {
                          rolePermissions: {
                            select: {
                              permission: {
                                select: {
                                  permissionName: true,
                                  access: true
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!userPermissions) {
        return res.status(200).json({ success: true, data: { permissions: [] } });
      }

      // Flatten and deduplicate permissions
      const permissions = userPermissions.userGroups.flatMap(ug =>
        ug.group.groupRoles.flatMap(gr =>
          gr.role.rolePermissions.map(rp => ({
            permissionName: rp.permission.permissionName,
            access: rp.permission.access
          }))
        )
      );
      const uniquePermissions = Array.from(new Set(permissions.map(p => JSON.stringify(p))))
        .map(p => JSON.parse(p));

      return res.status(200).json({
        success: true,
        data: { permissions: uniquePermissions }
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
