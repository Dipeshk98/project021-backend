import { RequestHandler } from 'express';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Team } from 'src/models/Team';
import { BillingService } from 'src/services/BillingService';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';

export class UserController {
  private billingService: BillingService;

  private userService: UserService;

  private teamService: TeamService;

  constructor(
    userService: UserService,
    billingService: BillingService,
    teamService: TeamService
  ) {
    this.userService = userService;
    this.billingService = billingService;
    this.teamService = teamService;
  }

  /**
   * Retrieve User information or create a new User, it happens when the user signs in for the first time.
   */
  public getProfile: RequestHandler = async (req, res) => {
    const user = await this.userService.findOrCreate(req.currentUserId);

    if (user.getTeamList().length === 0) {
      const team = new Team();
      team.setName('Team name');
      team.addMember(user.getId());
      this.teamService.save(team);

      user.addTeam(team.id);
      this.userService.update(user);
    }

    res.json({
      id: user.getId(),
      firstSignIn: user.getFirstSignIn().toISOString(),
      teamList: user.getTeamList(),
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
