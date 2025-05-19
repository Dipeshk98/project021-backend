import { Router } from 'express';
import { InitiationMetadataController } from '@/controllers/InitiationMetadataController';
import { InitiationMetadataRepository } from '@/repositories/InitiationMetadataRepository';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '@/middlewares/authMiddleware';

const prisma = new PrismaClient();
const initiationMetadataRepository = new InitiationMetadataRepository(prisma);
const initiationMetadataController = new InitiationMetadataController(initiationMetadataRepository);

const initiationMetadataRouter = Router();

// POST endpoint to create new initiation
initiationMetadataRouter.post(
  '/initiation',
  authenticate,
  initiationMetadataController.createInitiation
);

export { initiationMetadataRouter }; 