import {
  memberRepository,
  teamRepository,
  userRepository,
} from '@/repositories';
import { NotificationLogRepository } from '@/repositories/NotificationLogRepository';
import { PrismaClient } from '@prisma/client';
import { Env } from '@/utils/Env';
import { stripe } from '@/utils/Stripe';

import { BillingService } from './BillingService';
import { EmailService } from './EmailService';
import { NotificationService } from './NotificationService';
import { TeamService } from './TeamService';

// Manual `dependency injection` (DI) without external libraries.
// No overhead, some DI library can increase cold start in serverless architecture.
// You still get the same benefit: less complex code, decouple the code and make it easier for testing.
const teamService = new TeamService(
  teamRepository,
  userRepository,
  memberRepository
);
const billingService = new BillingService(
  teamRepository,
  stripe,
  Env.getValue('BILLING_PLAN_ENV')
);
const emailService = new EmailService();
const notificationLogRepository = new NotificationLogRepository(new PrismaClient());
const notificationService = new NotificationService(emailService, notificationLogRepository);

export { billingService, emailService, notificationService, teamService };
