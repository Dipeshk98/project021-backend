import { PrismaClient } from '@prisma/client';

import { Env } from './Env';

let dbClient: PrismaClient | null = null;

/**
 * Singleton for the connection to DynamoDB.
 */
export const getDBClient = () => {
  if (!dbClient) {
    let prismaOptions = {};

    if (Env.getValue('IS_TESTING', false)) {
      prismaOptions = {
        datasources: {
          db: {
            // eslint-disable-next-line no-underscore-dangle
            url: global.__MONGO_URI__.replace(
              '/?replicaSet=',
              '/nextless?replicaSet='
            ),
          },
        },
      };
    }

    dbClient = new PrismaClient(prismaOptions);
  }

  return dbClient;
};
