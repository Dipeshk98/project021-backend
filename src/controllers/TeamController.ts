import { TeamInviteEmail } from 'src/emails/TeamInviteEmail';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Member } from 'src/models/Member';
import { BillingService } from 'src/services/BillingService';
import { EmailService } from 'src/services/EmailService';
import { MemberService } from 'src/services/MemberService';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';
import { MemberStatus } from 'src/types/MemberStatus';
import {
  BodyCreateTeamHandler,
  BodyInviteHandler,
  BodyTeamNameHandler,
  FullJoinHandler,
  ParamsRemoveHandler,
  ParamsTeamIdHandler,
} from 'src/validations/TeamValidation';

export class TeamController {
  private teamService: TeamService;

  private userService: UserService;

  private memberService: MemberService;

  private billingService: BillingService;

  private emailService: EmailService;

  constructor(
    teamService: TeamService,
    userService: UserService,
    memberService: MemberService,
    billingService: BillingService,
    emailService: EmailService
  ) {
    this.teamService = teamService;
    this.userService = userService;
    this.memberService = memberService;
    this.billingService = billingService;
    this.emailService = emailService;
  }

  public create: BodyCreateTeamHandler = async (req, res) => {
    const user = await this.userService.strictFindByUserId(req.currentUserId);

    const team = await this.teamService.create(
      req.body.displayName,
      user.id,
      req.body.userEmail
    );

    user.addTeam(team.id);
    await this.userService.update(user);

    res.json({
      id: team.id,
      displayName: team.getDisplayName(),
    });
  };

  public delete: ParamsTeamIdHandler = async (req, res) => {
    const user = await this.userService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    user.removeTeam(req.params.teamId);
    await this.userService.update(user);

    let success = await this.memberService.deleteAllMembers(req.params.teamId);

    if (!success) {
      throw new ApiError('Not deleted');
    }

    success = await this.teamService.delete(req.params.teamId);

    if (!success) {
      throw new ApiError("Team ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    res.json({
      success: true,
    });
  };

  public updateDisplayName: BodyTeamNameHandler = async (req, res) => {
    await this.userService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    await this.teamService.updateDisplayName(
      req.params.teamId,
      req.body.displayName
    );

    res.json({
      id: req.params.teamId,
      displayName: req.body.displayName,
    });
  };

  public listMembers: ParamsTeamIdHandler = async (req, res) => {
    await this.userService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const list = await this.memberService.findAllByTeamId(req.params.teamId);

    res.json({
      list: list.map((elt) => ({
        userId: elt.skId,
        email: elt.getEmail(),
        status: elt.getStatus(),
      })),
    });
  };

  public getSettings: ParamsTeamIdHandler = async (req, res) => {
    const team = await this.teamService.findOnlyIfTeamMember(
      req.params.teamId,
      req.currentUserId
    );

    const plan = this.billingService.getPlanFromSubscription(
      team.getSubscription()
    );

    res.json({
      planId: plan.id,
      planName: plan.name,
      hasStripeCustomerId: team.hasStripeCustomerId(),
    });
  };

  public invite: BodyInviteHandler = async (req, res) => {
    const team = await this.teamService.findOnlyIfTeamMember(
      req.params.teamId,
      req.currentUserId
    );

    const member = new Member(req.params.teamId);
    member.setEmail(req.body.email);
    await this.memberService.save(member);

    await this.emailService.send(
      new TeamInviteEmail(team, member.skId),
      req.body.email
    );

    res.json({
      teamId: team.id,
      status: member.getStatus(),
      email: req.body.email,
    });
  };

  public join: FullJoinHandler = async (req, res) => {
    const user = await this.userService.strictFindByUserId(req.currentUserId);

    if (user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        'User is already a team member',
        null,
        ErrorCode.ALREADY_TEAM_MEMBER
      );
    }

    const team = await this.teamService.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError("Team ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    const success = await this.memberService.delete(
      req.params.teamId,
      req.params.verificationCode
    );

    if (!success) {
      throw new ApiError(
        "Todo ID doesn't exist",
        null,
        ErrorCode.INCORRECT_VERIFICATION_CODE
      );
    }

    user.addTeam(team.id);
    await this.userService.update(user);

    const newMember = new Member(req.params.teamId, req.currentUserId);
    newMember.setStatus(MemberStatus.ACTIVE);
    newMember.setEmail(req.body.email);
    await this.memberService.save(newMember);

    res.json({
      teamId: req.params.teamId,
      status: newMember.getStatus(),
      email: req.body.email,
    });
  };

  public remove: ParamsRemoveHandler = async (req, res) => {
    await this.userService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const list = await this.memberService.findAllByTeamId(req.params.teamId);

    if (list.length <= 1) {
      throw new ApiError(
        'Team member not able to remove',
        null,
        ErrorCode.MIN_ONE_TEAM_MEMBER
      );
    }

    const removedUser = await this.userService.findAndVerifyTeam(
      req.params.userId,
      req.params.teamId
    );

    removedUser.removeTeam(req.params.teamId);
    await this.userService.update(removedUser);

    const success = await this.memberService.delete(
      req.params.teamId,
      req.params.userId
    );

    if (!success) {
      throw new ApiError(
        "Member ID doesn't exist",
        null,
        ErrorCode.INCORRECT_ID
      );
    }

    res.json({
      success: true,
    });
  };
}
