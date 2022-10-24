module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'nextless',
    },
    replSet: {},
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
  },
  useSharedDBForAllJestWorkers: false,
};
