/* eslint-disable import/no-extraneous-dependencies,no-console */
const { MongoMemoryReplSet } = require('mongodb-memory-server');

(async () => {
  const mongodb = new MongoMemoryReplSet({
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

  console.log(mongodb.getUri());
})();
