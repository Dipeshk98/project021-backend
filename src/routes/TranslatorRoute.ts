import { TranslatorController } from '@controllers/TranslatorController';
import { TranslatorRepository } from '@/repositories/TranslatorRepository';
import { authenticate } from '@/middlewares/authMiddleware';
import { Router } from 'express';
import { dbClient } from '@/utils/DBClient';

const repository = new TranslatorRepository(dbClient);
const controller = new TranslatorController(repository);

const translatorRouter = Router();
translatorRouter.use(authenticate);

// POST route for creating a translator
translatorRouter.post('/translator/:form_id', controller.createTranslator);

export { translatorRouter };
