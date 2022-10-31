/* eslint-disable import/no-extraneous-dependencies,no-console */
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongodb: MongoMemoryReplSet | null = null;

(async () => {
  mongodb = new MongoMemoryReplSet({
    instanceOpts: [
      {
        port: 27017,
        storageEngine: 'wiredTiger',
      },
      {
        port: 27018,
        storageEngine: 'wiredTiger',
      },
    ],
  });

  await mongodb.start();

  console.log(`MongoDB endpoint: ${mongodb.getUri()}`);
})();

process.on('SIGINT', () => {
  if (mongodb) {
    mongodb.stop();
  }

  process.exit();
});
