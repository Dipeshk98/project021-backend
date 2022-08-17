import type { Entity } from 'dynamodb-onetable';

/**
 * Dynamodb schema following the single-table design principle
 */
export const schema = {
  version: '0.0.1',
  indexes: {
    primary: { hash: 'PK', sort: 'SK' },
  },
  models: {
    User: {
      PK: { type: String },
      SK: { type: String },
      firstSignIn: { type: Date },
      teamList: {
        type: Array,
        items: {
          type: String,
        },
      },
    },
    Team: {
      PK: { type: String },
      SK: { type: String },
      displayName: { type: String },
      stripeCustomerId: { type: String },
      subscription: {
        type: Object,
        schema: {
          id: { type: String },
          productId: { type: String },
          status: { type: String },
        },
      },
    },
    Member: {
      PK: { type: String },
      SK: { type: String },
      email: { type: String },
      status: { type: String, enum: ['ACTIVE', 'PENDING'] },
    },
    Todo: {
      PK: { type: String },
      SK: { type: String },
      title: { type: String },
    },
  } as const,
  params: {
    isoDates: true,
  },
};

export type PrimaryKeys = {
  PK?: string | null;
  SK?: string | null;
};

export type UserEntity = Entity<typeof schema.models.User>;
export type TeamEntity = Entity<typeof schema.models.Team>;
export type MemberEntity = Entity<typeof schema.models.Member>;
export type TodoEntity = Entity<typeof schema.models.Todo>;
