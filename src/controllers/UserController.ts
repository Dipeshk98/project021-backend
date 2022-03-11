import { RequestHandler } from 'express';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Member } from 'src/models/Member';
import { Team } from 'src/models/Team';
import { BillingService } from 'src/services/BillingService';
import { MemberService } from 'src/services/MemberService';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';
import { MemberStatus } from 'src/types/MemberStatus';
import { ParamsEmailHandler } from 'src/validations/UserValidation';

export class UserController {
  private billingService: BillingService;

  private userService: UserService;

  private teamService: TeamService;

  private memberService: MemberService;

  constructor(
    userService: UserService,
    billingService: BillingService,
    teamService: TeamService,
    memberService: MemberService
  ) {
    this.userService = userService;
    this.billingService = billingService;
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
      this.teamService.save(team);

      user.addTeam(team.id);
      this.userService.update(user);

      const member = new Member(team.getId(), user.getId());
      member.setStatus(MemberStatus.ACTIVE);
      member.setEmail(req.query.email);
      this.memberService.save(member);
    }

    const teamList = await this.teamService.findAllByTeamIdList(
      user.getTeamList()
    );

    res.json({
      id: user.getId(),
      firstSignIn: user.getFirstSignIn().toISOString(),
      teamList,
    });
  };

  public getSettings: RequestHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    const plan = this.billingService.getPlanFromSubscription(
      user.getSubscription()
    );

    res.json({
      planId: plan.id,
      planName: plan.name,
      hasStripeCustomerId: user.hasStripeCustomerId(),
    });
  };
}
