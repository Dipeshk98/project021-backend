import { DynamoDB } from 'aws-sdk';

import { Env } from './Env';

let dbClient: DynamoDB | null = null;

export const getDbClient = () => {
  if (!dbClient) {
    let offlineOptions = {};

    if (Env.getValue('IS_OFFLINE', false)) {
      offlineOptions = {
        region: 'localhost',
        endpoint: 'http://localhost:4567',
        accessKeyId: 'RANDOM_LOCAL_VALUE', // Needed for local environment in case AWS credentials isn't defined
        secretAccessKey: 'RANDOM_LOCAL_VALUE',
      };
    }

    dbClient = new DynamoDB({
      ...offlineOptions,
      httpOptions: {
        // Make the debugging easier if there is an error with DynamoDB by setting http timeout
        connectTimeout: 1000,
        timeout: 1000,
      },
    });
  }

  return dbClient;
};
