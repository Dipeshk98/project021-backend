import { billingService, todoService, userService } from 'src/services';

import { BillingController } from './BillingController';
import { TodoController } from './TodoController';
import { UserController } from './UserController';

// Manual `dependency injection` (DI) without external libraries.
// No overhead, some DI library can increase cold start in serverless architecture.
// You still get the same benefit: less complex code, decouple the code and make it easier for testing.
const userController = new UserController(userService, billingService);
const todoController = new TodoController(todoService);
const billingController = new BillingController(billingService, userService);

export { userController, todoController, billingController };
