import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import { Member } from '@/models/Member';
import { Team } from '@/models/Team';
import type { User } from '@/models/User';
import type { MemberRepository } from '@/repositories/MemberRepository';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import { MemberStatus } from '@/types/MemberStatus';

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

    const member = new Member(team.id, user.id);
    member.setStatus(MemberStatus.ACTIVE);
    member.setEmail(userEmail);
    await this.memberRepository.save(member);

    user.addTeam(team.id);
    await this.userRepository.save(user);

    return team;
  }

  async findOnlyIfTeamMember(teamId: string, userId: string) {
    await this.userRepository.findAndVerifyTeam(userId, teamId);

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
