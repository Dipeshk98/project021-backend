import { getDbClient } from 'src/utils/DBClient';

import { BillingService } from './BillingService';
import { TodoService } from './TodoService';
import { UserService } from './UserService';

const dbClient = getDbClient();

// Manual `dependency injection` (DI) without external libraries.
// No overhead, some DI library can increase cold start in serverless architecture.
// You still get the same benefit: less complex code, decouple the code and make it easier for testing.
const userService = new UserService(dbClient);
const todoService = new TodoService(dbClient);
const billingService = new BillingService(userService);

export { billingService, userService, todoService };
