import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';
import { BodyTeamNameHandler } from 'src/validations/TeamValidation';

export class TeamController {
  private teamService: TeamService;

  private userService: UserService;

  constructor(teamService: TeamService, userService: UserService) {
    this.teamService = teamService;
    this.userService = userService;
  }

  public updateDisplayName: BodyTeamNameHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
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
}
