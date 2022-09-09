import { AbstractModel } from './AbstractModel';
import type { UserEntity } from './Schema';

export class User extends AbstractModel<UserEntity> {
  static PREFIX_KEYS = 'USER#';

  public readonly id: string;

  private firstSignIn: Date;

  private teamList: string[];

  /**
   * Constructor for User class.
   * @constructor
   * @param id - The ID of the user.
   */
  constructor(id: string) {
    super();
    this.id = id;
    this.firstSignIn = new Date();
    this.teamList = [];
  }

  get pk() {
    return `${User.PREFIX_KEYS}${this.id}`;
  }

  get sk() {
    return `${User.PREFIX_KEYS}${this.id}`;
  }

  getFirstSignIn() {
    return this.firstSignIn;
  }

  setFirstSignIn(date: Date) {
    this.firstSignIn = date;
  }

  getTeamList() {
    return this.teamList;
  }

  addTeam(teamId: string) {
    this.teamList.push(teamId);
  }

  removeTeam(teamId: string) {
    this.teamList = this.teamList.filter((elt) => elt !== teamId);
  }

  toEntity() {
    return {
      ...this.keys(),
      firstSignIn: this.firstSignIn,
      teamList: this.teamList,
    };
  }

  fromEntity(entity: UserEntity) {
    if (entity.firstSignIn) this.firstSignIn = new Date(entity.firstSignIn);

    if (entity.teamList) this.teamList = entity.teamList;
  }
}
