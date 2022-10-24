import { PrismaClient } from '@prisma/client';

import { MemberRepository } from './MemberRepository';
import { TeamRepository } from './TeamRepository';
import { TodoRepository } from './TodoRepository';
import { UserRepository } from './UserRepository';

const prisma = new PrismaClient({
  datasources: {
    db: {
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      url: global.__MONGO_URI__.replace(
        '/?replicaSet=',
        '/nextless?replicaSet='
      ),
    },
  },
});

const memberRepository = new MemberRepository(prisma);
const teamRepository = new TeamRepository(prisma);
const todoRepository = new TodoRepository(prisma);
const userRepository = new UserRepository(prisma);

export { memberRepository, teamRepository, todoRepository, userRepository };
