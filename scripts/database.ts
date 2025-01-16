/* eslint-disable import/no-extraneous-dependencies,no-console */
import { MongoClient } from 'mongodb';
import pRetry from 'p-retry';
import { prismaDbPush } from './prisma';

(async () => {
  // Fetch the MongoDB connection URL from environment variable
  const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/your-database-name'; // Default to local if not set

  // Connect to MongoDB locally using MongoClient
  const client = new MongoClient(databaseUrl);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Successfully connected to MongoDB locally.');

    // Optionally, list available databases to ensure connection is successful
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases available:', databasesList.databases);
    
    // Set the environment variable to your local MongoDB instance
    process.env.MONGODB_DATABASE_ENDPOINT = databaseUrl;

    // Retry Prisma DB push if necessary
    await pRetry(prismaDbPush, { retries: 5 });
    console.log('MongoDB ready - endpoint:', process.env.MONGODB_DATABASE_ENDPOINT);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
})();

process.on('SIGINT', () => {
  console.log('Process interrupted. Exiting...');
  process.exit();
});
