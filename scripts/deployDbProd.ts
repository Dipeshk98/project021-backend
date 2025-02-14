/* eslint-disable import/no-extraneous-dependencies,no-console */
import { MongoClient } from 'mongodb';

import { prismaDbPush } from './prisma';

(async () => {
  // Fetch the MongoDB connection URL for production from environment variables
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL not set in the environment. Exiting...');
    process.exit(1);
  }

  // Connect to MongoDB in production using MongoClient
  const client = new MongoClient(databaseUrl);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB (Production).');

    // Optionally, list available databases to ensure connection
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases available in production:', databasesList.databases);

    // Set the environment variable to the correct production database URL
    process.env.MONGODB_DATABASE_ENDPOINT = databaseUrl;

    // Run Prisma DB push to apply schema changes
    await prismaDbPush();
    console.log('Prisma DB push successful.');
  } catch (error) {
    console.error('Error connecting to MongoDB (Production):', error);
  } finally {
    await client.close();
  }
})();

process.on('SIGINT', () => {
  console.log('Process interrupted. Exiting...');
  process.exit();
});
