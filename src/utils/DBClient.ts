import { DynamoDB } from 'aws-sdk';

import { Env } from './Env';

let dbClient: DynamoDB.DocumentClient | null = null;

/**
 * Singleton for the connection to DynamoDB.
 */
export const getDBClient = () => {
  if (!dbClient) {
    let dynamodbOptions = {};
    const mockDynamodbEndpoint = Env.getValue('MOCK_DYNAMODB_ENDPOINT', false);

    if (mockDynamodbEndpoint) {
      dynamodbOptions = {
        region: 'local',
        endpoint: mockDynamodbEndpoint,
        sslEnabled: false,
      };
    } else if (Env.getValue('IS_OFFLINE', false)) {
      dynamodbOptions = {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
      };
    }

    dbClient = new DynamoDB.DocumentClient({
      ...dynamodbOptions,
      httpOptions: {
        // Make the debugging easier if there is an error with DynamoDB by setting http timeout
        connectTimeout: 1000,
        timeout: 1000,
      },
    });
  }

  return dbClient;
};
