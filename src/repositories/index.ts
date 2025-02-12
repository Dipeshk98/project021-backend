import { dbClient } from '@/utils/DBClient';

import { I9DocumentRepository } from './i9DocumentRepository';
import { I9EmployerRepository } from './I9EmployerRepository';
import { I9FormRepository } from './I9FormRepository';
import { I9ReverificationRepository } from './I9ReverificationRepository';
import { I9UserRepository } from './I9UserRepository';
import { MemberRepository } from './MemberRepository';
import { TeamRepository } from './TeamRepository';
import { TodoRepository } from './TodoRepository';
import { UserRepository } from './UserRepository';

const memberRepository = new MemberRepository(dbClient);
const teamRepository = new TeamRepository(dbClient);
const todoRepository = new TodoRepository(dbClient);
const userRepository = new UserRepository(dbClient);
const i9UserRepository = new I9UserRepository(dbClient);
const i9DocumentRepository = new I9DocumentRepository(dbClient);
const i9EmployerRepository = new I9EmployerRepository(dbClient);
const i9FormRepository = new I9FormRepository(dbClient);
const i9Reverification = new I9ReverificationRepository(dbClient);

export {
  i9DocumentRepository,
  i9EmployerRepository,
  i9FormRepository,
  i9Reverification,
  i9UserRepository,
  memberRepository,
  teamRepository,
  todoRepository,
  userRepository,
};
