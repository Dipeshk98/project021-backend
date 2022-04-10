import { AbstractItem, IDynamodbItem } from './AbstractItem';

export class User extends AbstractItem {
  static BEGINS_KEYS = 'USER#';

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
    return `${User.BEGINS_KEYS}${this.id}`;
  }

  get sk() {
    return `${User.BEGINS_KEYS}${this.id}`;
  }

  getFirstSignIn() {
    return this.firstSignIn;
  }

  getTeamList() {
    return this.teamList;
  }

  isTeamMember(teamId: string) {
    return this.teamList.includes(teamId);
  }

  addTeam(teamId: string) {
    this.teamList.push(teamId);
  }

  removeTeam(teamId: string) {
    this.teamList = this.teamList.filter((elt) => elt !== teamId);
  }

  toItem() {
    return {
      ...this.keys(),
      firstSignIn: this.firstSignIn.toISOString(),
      teamList: this.teamList,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.firstSignIn = new Date(item.firstSignIn);
    this.teamList = item.teamList;
  }
}
