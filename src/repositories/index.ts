import { getDBTable } from '@/models/DBTable';

import { MemberRepository } from './MemberRepository';
import { TeamRepository } from './TeamRepository';
import { TodoRepository } from './TodoRepository';
import { UserRepository } from './UserRepository';

const dbTable = getDBTable();

const memberRepository = new MemberRepository(dbTable);
const teamRepository = new TeamRepository(dbTable);
const todoRepository = new TodoRepository(dbTable);
const userRepository = new UserRepository(dbTable);

export { memberRepository, teamRepository, todoRepository, userRepository };
