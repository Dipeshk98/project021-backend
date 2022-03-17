import { TeamInviteEmail } from 'src/emails/TeamInviteEmail';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Member } from 'src/models/Member';
import { Team } from 'src/models/Team';
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
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    const team = new Team();
    team.setDisplayName(req.body.displayName);
    await this.teamService.save(team);

    user.addTeam(team.id);
    await this.userService.update(user);

    const member = new Member(team.getId(), user.getId());
    member.setStatus(MemberStatus.ACTIVE);
    member.setEmail(req.body.userEmail);
    await this.memberService.save(member);

    res.json({
      id: team.getId(),
      displayName: team.getDisplayName(),
    });
  };

  public delete: ParamsTeamIdHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

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
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

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
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const list = await this.memberService.findAllByTeamId(req.params.teamId);

    res.json({
      list: list.map((elt) => ({
        userId: elt.getSkId(),
        email: elt.getEmail(),
        status: elt.getStatus(),
      })),
    });
  };

  public getSettings: ParamsTeamIdHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const team = await this.teamService.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError("Team ID doesn't exist");
    }

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
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const team = await this.teamService.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError("Team ID doesn't exist");
    }

    const member = new Member(req.params.teamId);
    member.setEmail(req.body.email);
    await this.memberService.save(member);

    await this.emailService.send(
      new TeamInviteEmail(team, member.getSkId()),
      req.body.email
    );

    res.json({
      teamId: team.getId(),
      status: member.getStatus(),
      email: req.body.email,
    });
  };

  public join: FullJoinHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

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
}
