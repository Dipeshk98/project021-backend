/* eslint-disable import/no-extraneous-dependencies,no-console */
import { PrismaClient } from '@prisma/client';
import pRetry from 'p-retry';

const prisma = new PrismaClient();

const prismaDbPush = async () => {
  try {
    console.log('Pushing Prisma schema to PostgreSQL...');
    await prisma.$executeRaw`SELECT 1`; // Verify the connection
    console.log('Prisma schema successfully synced with PostgreSQL');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
};

(async () => {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/mydatabase';

  await pRetry(prismaDbPush, { retries: 5 });

  console.log(`PostgreSQL ready - endpoint: ${process.env.DATABASE_URL}`);
})();

process.on('SIGINT', async () => {
  console.log('Closing PostgreSQL connection...');
  await prisma.$disconnect();
  process.exit();
});

export { prisma };
