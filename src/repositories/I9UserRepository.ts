import type { PrismaClient, I9Users} from '@prisma/client';
import { AbstractRepository } from './AbstractRepository';

export class I9UserRepository extends AbstractRepository<
  PrismaClient['i9Users'], // Use the I9Users table
  I9Users,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9Users);
  }

  // Fetch an I-9 user by user_id
  async findI9UserById(user_id: string): Promise<I9Users | null> {
    return this.dbClient.findUnique({
      where: { user_id },
    });
  }
 // Fetch an I-9 user by email
 async findI9UserByEmail(email: string): Promise<I9Users | null> {
  return this.dbClient.findUnique({
    where: { email },
  });
}
// Create a new I-9 user
async create(data: Partial<I9Users>): Promise<I9Users> {
  return this.dbClient.create({
    data
  });
}
}
