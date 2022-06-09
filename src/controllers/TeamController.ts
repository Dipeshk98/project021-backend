import { TeamInviteEmailTemplate } from '@/emails/TeamInviteEmailTemplate';
import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import { Member } from '@/models/Member';
import { BillingService } from '@/services/BillingService';
import { EmailService } from '@/services/EmailService';
import { MemberService } from '@/services/MemberService';
import { TeamService } from '@/services/TeamService';
import { UserService } from '@/services/UserService';
import { MemberStatus } from '@/types/MemberStatus';
import {
  BodyCreateTeamHandler,
  BodyInviteHandler,
  BodyTeamNameHandler,
  FullJoinHandler,
  ParamsJoinHandler,
  ParamsRemoveHandler,
  ParamsTeamIdHandler,
} from '@/validations/TeamValidation';

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

    const deleteMembersRes = await this.memberService.deleteAllMembers(
      req.params.teamId
    );

    if (!deleteMembersRes) {
      // DynamoDB couldn't successfully delete all members.
      throw new ApiError('Not all members has been deleted');
    }

    const deleteTeamRes = await this.teamService.delete(req.params.teamId);

    if (!deleteTeamRes) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
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
        memberId: elt.skId,
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
      new TeamInviteEmailTemplate(team, member.skId),
      req.body.email
    );

    res.json({
      teamId: team.id,
      status: member.getStatus(),
      email: req.body.email,
    });
  };

  public getJoinInfo: ParamsJoinHandler = async (req, res) => {
    const team = await this.teamService.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
    }

    const member = await this.memberService.findByKeys(
      req.params.teamId,
      req.params.verificationCode
    );

    if (!member || member.getStatus() === MemberStatus.ACTIVE) {
      throw new ApiError('Incorrect code', null, ErrorCode.INCORRECT_CODE);
    }

    res.json({
      displayName: team.getDisplayName(),
    });
  };

  public join: FullJoinHandler = async (req, res) => {
    const user = await this.userService.strictFindByUserId(req.currentUserId);

    if (user.isTeamMember(req.params.teamId)) {
      throw new ApiError('Already a member', null, ErrorCode.ALREADY_MEMBER);
    }

    const team = await this.teamService.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
    }

    const deleteRes = await this.memberService.deleteOnlyInPending(
      req.params.teamId,
      req.params.verificationCode
    );

    if (!deleteRes) {
      throw new ApiError('Incorrect code', null, ErrorCode.INCORRECT_CODE);
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

    if (!req.query.isPending) {
      // When the user is in active status/when the user has accepted the invitation
      const removedUser = await this.userService.findAndVerifyTeam(
        req.params.memberId,
        req.params.teamId
      );

      removedUser.removeTeam(req.params.teamId);
      await this.userService.update(removedUser);
    }

    const success = await this.memberService.delete(
      req.params.teamId,
      req.params.memberId
    );

    if (!success) {
      // In `User` class, the user is a team member.
      // In `Member` class, the user isn't a team member.
      // The data is inconsistent and shouldn't happen.
      throw new ApiError(
        "It shouldn't happen: inconsistent data",
        null,
        ErrorCode.INCORRECT_DATA
      );
    }

    res.json({
      success: true,
    });
  };
}
