import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Member } from 'src/models/Member';
import { Team } from 'src/models/Team';
import { MemberStatus } from 'src/types/MemberStatus';
import { ISubscription } from 'src/types/StripeTypes';
import { Env } from 'src/utils/Env';

import { MemberService } from './MemberService';
import { UserService } from './UserService';

export class TeamService {
  private dbClient: DynamoDB;

  private tableName: string;

  private userService: UserService;

  private memberService: MemberService;

  constructor(
    dbClient: DynamoDB,
    userService: UserService,
    memberService: MemberService
  ) {
    this.dbClient = dbClient;
    this.tableName = Env.getValue('TABLE_NAME');
    this.userService = userService;
    this.memberService = memberService;
  }

  async create(displayName: string, userId: string, userEmail: string) {
    const team = new Team();
    team.setDisplayName(displayName);
    await this.save(team);

    const member = new Member(team.id, userId);
    member.setStatus(MemberStatus.ACTIVE);
    member.setEmail(userEmail);
    await this.memberService.save(member);

    return team;
  }

  async save(team: Team) {
    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(team.toItem()),
          ConditionExpression:
            'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        })
        .promise();
    } catch (ex: any) {
      throw new ApiError('TodoService: impossible to create', ex);
    }
  }

  public async delete(teamId: string) {
    const todo = new Team(teamId);

    try {
      const result = await this.dbClient
        .deleteItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall(todo.keys()),
          ReturnValues: 'ALL_OLD',
        })
        .promise();

      return !!result.Attributes;
      // Return true when we successfully delete the item
      // Otherwise, it return false, it happens the item doesn't exists
    } catch (e: any) {
      throw new ApiError('DBClient error: "delete" operation impossible', e);
    }
  }

  public async findByTeamId(teamId: string) {
    const team = new Team(teamId);

    try {
      const result = await this.dbClient
        .getItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall(team.keys()),
        })
        .promise();

      if (!result.Item) {
        return null;
      }

      team.fromItem(DynamoDB.Converter.unmarshall(result.Item));
    } catch (ex: any) {
      throw new ApiError('UserService: get operation impossible', ex);
    }

    return team;
  }

  public async findOnlyIfTeamMember(teamId: string, userId: string) {
    await this.userService.findAndVerifyTeam(userId, teamId);

    const team = await this.findByTeamId(teamId);

    if (!team) {
      throw new ApiError(
        `Incorrect TeamID ${teamId}`,
        null,
        ErrorCode.INCORRECT_TEAM_ID
      );
    }

    return team;
  }

  public async findAllByTeamIdList(teamIdList: string[]) {
    try {
      const result = await this.dbClient
        .batchGetItem({
          RequestItems: {
            [this.tableName]: {
              Keys: teamIdList.map((elt) =>
                DynamoDB.Converter.marshall({
                  PK: `${Team.BEGINS_KEYS}${elt}`,
                  SK: `${Team.BEGINS_KEYS}${elt}`,
                })
              ),
            },
          },
        })
        .promise();

      const response = result.Responses && result.Responses[this.tableName];

      if (!response) {
        return [];
      }

      return response
        .map((elt) => {
          const item = DynamoDB.Converter.unmarshall(elt);
          const team = new Team(item.PK, true);
          team.fromItem(item);
          return team;
        })
        .sort((team1, team2) => team1.id.localeCompare(team2.id));
    } catch (e: any) {
      throw new ApiError(
        'DBClient error: "findAllByTeamIdList" operation impossible',
        e
      );
    }
  }

  public async update(team: Team) {
    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(team.toItem()),
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        })
        .promise();

      return true;
    } catch (e: any) {
      if (e.code === 'ConditionalCheckFailedException') {
        return false;
      }

      throw new ApiError('DBClient error: "update" operation impossible', e);
    }
  }

  public async updateDisplayName(teamId: string, displayName: string) {
    try {
      await this.dbClient
        .updateItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall({
            PK: `${Team.BEGINS_KEYS}${teamId}`,
            SK: `${Team.BEGINS_KEYS}${teamId}`,
          }),
          UpdateExpression: 'SET displayName = :displayName',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':displayName': displayName,
          }),
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        })
        .promise();

      return true;
    } catch (e: any) {
      if (e.code === 'ConditionalCheckFailedException') {
        return false;
      }

      throw new ApiError('DBClient error: "update" operation impossible', e);
    }
  }

  public async updateSubscription(teamId: string, subscription: ISubscription) {
    try {
      await this.dbClient
        .updateItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall({
            PK: `${Team.BEGINS_KEYS}${teamId}`,
            SK: `${Team.BEGINS_KEYS}${teamId}`,
          }),
          UpdateExpression: 'SET subscription = :subscription',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':subscription': subscription,
          }),
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        })
        .promise();

      return true;
    } catch (e: any) {
      if (e.code === 'ConditionalCheckFailedException') {
        return false;
      }

      throw new ApiError('DBClient error: "update" operation impossible', e);
    }
  }
}
