import { spawn as spawnCb } from 'child_process';
import { promisify } from 'util';

const spawn = promisify(spawnCb);

export const prismaDbPush = () => {
  return spawn('prisma', ['db', 'push'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.MONGODB_DATABASE_ENDPOINT,
    },
  });
};
