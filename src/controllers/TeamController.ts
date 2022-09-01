import { TeamInviteEmailTemplate } from '@/emails/TeamInviteEmailTemplate';
import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import { Member } from '@/models/Member';
import type { MemberRepository } from '@/repositories/MemberRepository';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import type { BillingService } from '@/services/BillingService';
import type { EmailService } from '@/services/EmailService';
import type { TeamService } from '@/services/TeamService';
import { MemberRole, MemberStatus } from '@/types/Member';
import type {
  BodyCreateTeamHandler,
  BodyInviteHandler,
  BodyTeamNameHandler,
  FullJoinHandler,
  ParamsEditMemberHandler,
  ParamsJoinHandler,
  ParamsRemoveMemberHandler,
  ParamsTeamIdHandler,
} from '@/validations/TeamValidation';

export class TeamController {
  private teamService: TeamService;

  private userRepository: UserRepository;

  private memberRepository: MemberRepository;

  private teamRepository: TeamRepository;

  private billingService: BillingService;

  private emailService: EmailService;

  constructor(
    teamService: TeamService,
    userRepository: UserRepository,
    memberRepository: MemberRepository,
    teamRepository: TeamRepository,
    billingService: BillingService,
    emailService: EmailService
  ) {
    this.teamService = teamService;
    this.userRepository = userRepository;
    this.memberRepository = memberRepository;
    this.teamRepository = teamRepository;
    this.billingService = billingService;
    this.emailService = emailService;
  }

  public create: BodyCreateTeamHandler = async (req, res) => {
    const user = await this.userRepository.strictFindByUserId(
      req.currentUserId
    );

    const team = await this.teamService.create(
      req.body.displayName,
      user,
      req.body.userEmail
    );

    res.json({
      id: team.id,
      displayName: team.getDisplayName(),
    });
  };

  public delete: ParamsTeamIdHandler = async (req, res) => {
    await this.teamService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId,
      [MemberRole.OWNER, MemberRole.ADMIN]
    );

    await this.teamService.delete(req.params.teamId);

    res.json({
      success: true,
    });
  };

  public updateDisplayName: BodyTeamNameHandler = async (req, res) => {
    await this.teamService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId,
      [MemberRole.OWNER, MemberRole.ADMIN]
    );

    await this.teamRepository.updateDisplayName(
      req.params.teamId,
      req.body.displayName
    );

    res.json({
      id: req.params.teamId,
      displayName: req.body.displayName,
    });
  };

  public listMembers: ParamsTeamIdHandler = async (req, res) => {
    await this.teamService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const list = await this.memberRepository.findAllByTeamId(req.params.teamId);

    res.json({
      list: list.map((elt) => ({
        memberId: elt.skId,
        email: elt.getEmail(),
        role: elt.getRole(),
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
      req.currentUserId,
      [MemberRole.OWNER, MemberRole.ADMIN]
    );

    const member = new Member(req.params.teamId);
    member.setEmail(req.body.email);
    member.setRole(req.body.role);
    await this.memberRepository.save(member);

    await this.emailService.send(
      new TeamInviteEmailTemplate(team, member.skId),
      req.body.email
    );

    res.json({
      teamId: team.id,
      email: member.getEmail(),
      role: member.getRole(),
      status: member.getStatus(),
    });
  };

  public getJoinInfo: ParamsJoinHandler = async (req, res) => {
    const team = await this.teamRepository.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
    }

    const member = await this.memberRepository.findByKeys(
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
    const user = await this.userRepository.strictFindByUserId(
      req.currentUserId
    );

    const member = await this.teamService.findTeamMember(
      user.id,
      req.params.teamId
    );

    if (member) {
      throw new ApiError('Already a member', null, ErrorCode.ALREADY_MEMBER);
    }

    const team = await this.teamRepository.findByTeamId(req.params.teamId);

    if (!team) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
    }

    const deleteRes = await this.memberRepository.deleteOnlyInPending(
      req.params.teamId,
      req.params.verificationCode
    );

    if (!deleteRes) {
      throw new ApiError('Incorrect code', null, ErrorCode.INCORRECT_CODE);
    }

    const newMember = await this.teamService.join(
      team,
      user,
      req.body.email,
      deleteRes.getRole()
    );

    res.json({
      teamId: req.params.teamId,
      email: req.body.email,
      role: newMember.getRole(),
      status: newMember.getStatus(),
    });
  };

  public editMember: ParamsEditMemberHandler = async (req, res) => {
    await this.teamService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId,
      [MemberRole.OWNER, MemberRole.ADMIN]
    );

    const updateRes = await this.memberRepository.updateRoleIfNotOwner(
      req.params.teamId,
      req.params.memberId,
      req.body.role
    );

    if (!updateRes) {
      // By default, the frontend won't display the option to update role for the owner.
      // If it raises an error, someone try to bypass the frontend? Or is it a bug?
      throw new ApiError(
        'Incorrect Member ID or the member has the OWNER ROLE',
        null,
        ErrorCode.INCORRECT_DATA
      );
    }

    res.json({
      teamId: req.params.teamId,
      memberId: req.params.memberId,
      role: req.body.role,
    });
  };

  public removeMember: ParamsRemoveMemberHandler = async (req, res) => {
    await this.teamService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId,
      [MemberRole.OWNER, MemberRole.ADMIN]
    );

    const member = await this.memberRepository.findByKeys(
      req.params.teamId,
      req.params.memberId
    );

    if (!member) {
      throw new ApiError(
        'Incorrect MemberID',
        null,
        ErrorCode.INCORRECT_MEMBER_ID
      );
    }

    if (member.getStatus() === MemberStatus.ACTIVE) {
      const removedUser = await this.teamService.findAndVerifyTeam(
        req.params.memberId,
        req.params.teamId
      );

      removedUser.removeTeam(req.params.teamId);
      await this.userRepository.save(removedUser);
    }

    const success = await this.memberRepository.deleteByKeys(
      member.getTeamId(),
      member.skId
    );

    if (!success) {
      throw new ApiError('Impossible to delete');
    }

    res.json({
      success: true,
    });
  };
}
