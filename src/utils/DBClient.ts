import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

import { Env } from './Env';

let dbClient: PrismaClient | null = null;

/**
 * Singleton for the connection to DynamoDB.
 */
export const getDBClient = () => {
  if (!dbClient) {
    let prismaOptions: Prisma.PrismaClientOptions = {};
    const mockPrismaEndpoint = Env.getValue(
      'MOCK_MONGODB_DATABASE_ENDPOINT',
      false
    );

    if (mockPrismaEndpoint) {
      prismaOptions = {
        datasources: {
          db: {
            url: mockPrismaEndpoint,
          },
        },
      };
    }

    dbClient = new PrismaClient(prismaOptions);
  }

  return dbClient;
};
