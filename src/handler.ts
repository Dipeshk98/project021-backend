import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { Request } from 'express';
import serverlessHttp from 'serverless-http';

import { app } from './app';
import { ApiError } from './error/ApiError';
import { Env } from './utils/Env';

// Wrap `serverless-http` around Express.js
export const handler = serverlessHttp(app, {
  request(req: Request, context: APIGatewayProxyEvent) {
    // authProvider will be defined if the route is protected by the default aws_iam API gateway authorizer.
    let authProvider =
      context.requestContext.authorizer?.iam?.cognitoIdentity?.amr?.[2];

    if (Env.getValue('IS_OFFLINE', false)) {
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
