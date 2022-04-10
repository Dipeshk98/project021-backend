import { MemberService } from 'src/services/MemberService';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';
import {
  BodyEmailHandler,
  ParamsEmailHandler,
} from 'src/validations/UserValidation';

export class UserController {
  private userService: UserService;

  private teamService: TeamService;

  private memberService: MemberService;

  constructor(
    userService: UserService,
    teamService: TeamService,
    memberService: MemberService
  ) {
    this.userService = userService;
    this.teamService = teamService;
    this.memberService = memberService;
  }

  /**
   * Retrieve User information or create a new User, it happens when the user signs in for the first time.
   */
  public getProfile: ParamsEmailHandler = async (req, res) => {
    const user = await this.userService.findOrCreate(req.currentUserId);

    if (user.getTeamList().length === 0) {
      const team = await this.teamService.create(
        'New Team',
        user.id,
        req.query.email
      );

      user.addTeam(team.id);
      await this.userService.update(user);
    }

    const teamList = await this.teamService.findAllByTeamIdList(
      user.getTeamList()
    );

    res.json({
      id: user.id,
      firstSignIn: user.getFirstSignIn().toISOString(),
      teamList,
    });
  };

  public updateEmail: BodyEmailHandler = async (req, res) => {
    const user = await this.userService.strictFindByUserId(req.currentUserId);

    await this.memberService.updateEmail(user, req.body.email);

    res.json({
      id: user.id,
      email: req.body.email,
    });
  };
}
