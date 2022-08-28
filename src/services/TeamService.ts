import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import { Member } from '@/models/Member';
import { Team } from '@/models/Team';
import type { User } from '@/models/User';
import type { MemberRepository } from '@/repositories/MemberRepository';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import { MemberRole, MemberStatus } from '@/types/Member';

export class TeamService {
  private teamRepository: TeamRepository;

  private userRepository: UserRepository;

  private memberRepository: MemberRepository;

  constructor(
    teamRepository: TeamRepository,
    userRepository: UserRepository,
    memberRepository: MemberRepository
  ) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.memberRepository = memberRepository;
  }

  async create(displayName: string, user: User, userEmail: string) {
    const team = new Team();
    team.setDisplayName(displayName);
    await this.teamRepository.save(team);

    await this.join(team, user, userEmail, MemberRole.OWNER);

    return team;
  }

  async delete(teamId: string) {
    const memberList = await this.memberRepository.deleteAllMembers(teamId);

    if (!memberList) {
      throw new ApiError(
        `Nothing to delete, the team member list was empty`,
        null,
        ErrorCode.INCORRECT_DATA
      );
    }

    // run sequentially (not in parallel) with classic loop, `forEach` is not designed for asynchronous code.
    // eslint-disable-next-line no-restricted-syntax
    for (const elt of memberList) {
      if (elt.getStatus() === MemberStatus.ACTIVE) {
        // eslint-disable-next-line no-await-in-loop
        await this.userRepository.removeTeam(elt.skId, teamId);
      }
    }

    const deleteTeamRes = await this.teamRepository.deleteByTeamId(teamId);

    if (!deleteTeamRes) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
    }
  }

  async join(team: Team, user: User, userEmail: string, role: MemberRole) {
    const member = new Member(team.id, user.id);
    member.setEmail(userEmail);
    member.setRole(role);
    member.setStatus(MemberStatus.ACTIVE);
    await this.memberRepository.save(member);

    user.addTeam(team.id);
    await this.userRepository.save(user);

    return member;
  }

  async findTeamMember(userId: string, teamId: string) {
    const member = await this.memberRepository.findByKeys(teamId, userId);

    if (!member || member.getStatus() !== MemberStatus.ACTIVE) {
      return null;
    }

    return member;
  }

  async findAndVerifyTeam(
    userId: string,
    teamId: string,
    requiredRoles: MemberRole[] = [
      MemberRole.OWNER,
      MemberRole.ADMIN,
      MemberRole.READ_ONLY,
    ]
  ) {
    const user = await this.userRepository.strictFindByUserId(userId);
    const member = await this.findTeamMember(userId, teamId);

    if (!member) {
      throw new ApiError(
        `User ${userId} isn't a team member of ${teamId}`,
        null,
        ErrorCode.NOT_MEMBER
      );
    }

    if (!requiredRoles.includes(member.getRole())) {
      throw new ApiError(
        `The user role ${member.getRole()} are not able to perform the action`,
        null,
        ErrorCode.INCORRECT_PERMISSION
      );
    }

    return user;
  }

  async findOnlyIfTeamMember(teamId: string, userId: string) {
    await this.findAndVerifyTeam(userId, teamId);

    const team = await this.teamRepository.findByTeamId(teamId);

    if (!team) {
      throw new ApiError(
        `Incorrect TeamID ${teamId}`,
        null,
        ErrorCode.INCORRECT_TEAM_ID
      );
    }
    return team;
  }

  async updateEmailAllTeams(user: User, email: string) {
    const teamList = user.getTeamList();

    // run sequentially (not in parallel) with classic loop, `forEach` is not designed for asynchronous code.
    // eslint-disable-next-line no-restricted-syntax
    for (const elt of teamList) {
      // eslint-disable-next-line no-await-in-loop
      await this.memberRepository.updateEmail(elt, user.id, email);
    }
  }
}
