import {
  memberRepository,
  teamRepository,
  userRepository,
} from '@/repositories';

import { BillingService } from './BillingService';
import { EmailService } from './EmailService';
import { TeamService } from './TeamService';

// Manual `dependency injection` (DI) without external libraries.
// No overhead, some DI library can increase cold start in serverless architecture.
// You still get the same benefit: less complex code, decouple the code and make it easier for testing.
const teamService = new TeamService(
  teamRepository,
  userRepository,
  memberRepository
);
const billingService = new BillingService(teamRepository);
const emailService = new EmailService();

export { billingService, emailService, teamService };
