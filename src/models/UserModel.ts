import type { User } from '@prisma/client';
import { AbstractModel } from './AbstractModel';

export class UserModel extends AbstractModel<User> {
  public readonly providerId: string;

  private firstSignIn: Date;

  private teamList: string[];

  constructor(providerId: string) {
    super();
    this.providerId = providerId;
    this.firstSignIn = new Date();
    this.teamList = [];
  }

  setFirstSignIn(date: Date) {
    this.firstSignIn = date;
  }

  getFirstSignIn() {
    return this.firstSignIn;
  }

  setTeamList(teamList: string[]) {
    this.teamList = teamList;
  }

  getTeamList() {
    return this.teamList;
  }

  keys() {
    return {
      providerId: this.providerId,
    };
  }

  toCreateEntity() {
    return {
      ...this.keys(),
      firstSignIn: this.firstSignIn,
      teamList: this.teamList,
    };
  }

  toEntity() {
    return {
      firstSignIn: this.firstSignIn,
      teamList: this.teamList,
    };
  }

  fromEntity(entity: User) {
    this.firstSignIn = entity.firstSignIn;
    this.teamList = entity.teamList;
  }
}
