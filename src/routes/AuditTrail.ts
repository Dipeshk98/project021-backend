import { auditTrailController } from '@/controllers/auditTrailController';
import { AuditTrailRepository } from '@/repositories/AuditTrailRepository';
import { authenticate } from '@/middlewares/authMiddleware';
import { Router } from 'express';
import { dbClient } from '@/utils/DBClient';

const repository = new AuditTrailRepository(dbClient);
const controller = new auditTrailController(repository);


const audittrailRouter = Router();

export { audittrailRouter };
audittrailRouter.use(authenticate);

audittrailRouter.post('/audit/:form_id', controller.createAudit);
