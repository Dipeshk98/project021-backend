import {
  memberRepository,
  teamRepository,
  todoRepository,
  userRepository,
  i9UserRepository,
  i9DocumentRepository,
  i9EmployerRepository,
  i9FormRepository,
  i9Reverification,
} from '@/repositories';
import { billingService, emailService, teamService } from '@/services';

import { BillingController } from './BillingController';
import { TeamController } from './TeamController';
import { TodoController } from './TodoController';
import { UserController } from './UserController';
import { I9UserController } from './I9UserController';

// Manual `dependency injection` (DI) without external libraries.
// No overhead, some DI library can increase cold start in serverless architecture.
// You still get the same benefit: less complex code, decouple the code and make it easier for testing.
const userController = new UserController(
  teamService,
  userRepository,
  teamRepository,
  i9UserRepository, 
  emailService
);
const I9userController = new I9UserController(
  teamService,
  userRepository,
  teamRepository,
  i9UserRepository, 
  emailService,
  i9DocumentRepository,
  i9EmployerRepository,
  i9FormRepository,
  i9Reverification,
);
const todoController = new TodoController(teamService, todoRepository);
const billingController = new BillingController(teamService, billingService);
const teamController = new TeamController(
  teamService,
  userRepository,
  memberRepository,
  teamRepository,
  billingService,
  emailService
);

export { billingController, teamController, todoController, userController,I9userController };
