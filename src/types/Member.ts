// If you update this file, you also need to update the models/Schema.ts file
export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  READ_ONLY = 'READ_ONLY',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
}
