import { Member } from 'src/models/Member';
import { Team } from 'src/models/Team';
import { MemberService } from 'src/services/MemberService';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';
import { MemberStatus } from 'src/types/MemberStatus';
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
      const team = new Team();
      team.setDisplayName('Team name');
      await this.teamService.save(team);

      user.addTeam(team.id);
      await this.userService.update(user);

      const member = new Member(team.id, user.id);
      member.setStatus(MemberStatus.ACTIVE);
      member.setEmail(req.query.email);
      await this.memberService.save(member);
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
