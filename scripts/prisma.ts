/* eslint-disable import/no-extraneous-dependencies */
import { spawn as spawnCb } from 'cross-spawn';
import { promisify } from 'util';

// Promisify the spawn function for convenience
const spawn = promisify(spawnCb);

// This function is used to apply Prisma DB schema changes
export const prismaDbPush = () => {
  return spawn('prisma', ['db', 'push'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.MONGODB_DATABASE_ENDPOINT, // Ensure Prisma uses the correct MongoDB connection string
    },
  });
};
