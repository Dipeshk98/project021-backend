import { PrismaClient } from '@prisma/client';

let dbClient: PrismaClient | null = null;

/**
 * Singleton for the connection to DynamoDB.
 */
export const getDBClient = () => {
  if (!dbClient) {
    dbClient = new PrismaClient();
  }

  return dbClient;
};
