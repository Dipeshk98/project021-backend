import { APIGatewayProxyEvent } from 'aws-lambda';
import express, { json, Request } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import serverlessHttp from 'serverless-http';

import { errorHandler, handler404 } from './controllers/ErrorController';
import { ApiError } from './error/ApiError';
import { billingRouter } from './routes/BillingRoute';
import { todoRouter } from './routes/TodoRoute';
import { userRouter } from './routes/UserRoute';
import { Env } from './utils/Env';

const app = express();
// Needed to secure the Stripe webhook
app.use('/billing/webhook', express.raw({ type: 'application/json' }));

// Load Express middlewares
app.use(json());
app.use(helmet());

// Load Express routers
app.use(userRouter);
app.use(todoRouter);
app.use(billingRouter);

// Error handler
app.use(handler404);
app.use(errorHandler);

// Wrap serverless-http around Express
export const handler = serverlessHttp(app, {
  request(req: Request, context: APIGatewayProxyEvent) {
    // authProvider will be defined if the route is protected by the default aws_iam API gateway authorizer.
    let authProvider =
      context.requestContext.authorizer?.iam?.cognitoIdentity?.amr?.[2];

    if (Env.getValue('IS_OFFLINE')) {
      // In local environment, we set manually an authProvider value
      authProvider = Env.getValue('COGNITO_USER_ID_LOCAL', true);
    }

    // authProvider is empty when the default `aws_iam` is defined.
    // When the route in API gateway is public, no need authentication.
    if (authProvider) {
      const parts = authProvider.split(':');
      // Set `currentUserId` in Express request.
      req.currentUserId = parts[parts.length - 1] || '';

      if (!req.currentUserId) {
        throw new ApiError('AuthProvider format is incorrect');
      }
    }
  },
});
