import { getDbClient } from 'src/utils/DBClient';

import { BillingService } from './BillingService';
import { EmailService } from './EmailService';
import { MemberService } from './MemberService';
import { TeamService } from './TeamService';
import { TodoService } from './TodoService';
import { UserService } from './UserService';

const dbClient = getDbClient();

// Manual `dependency injection` (DI) without external libraries.
// No overhead, some DI library can increase cold start in serverless architecture.
// You still get the same benefit: less complex code, decouple the code and make it easier for testing.
const userService = new UserService(dbClient);
const todoService = new TodoService(dbClient);
const teamService = new TeamService(dbClient);
const memberService = new MemberService(dbClient);
const billingService = new BillingService(userService);
const emailService = new EmailService();

export {
  billingService,
  userService,
  todoService,
  emailService,
  teamService,
  memberService,
};
