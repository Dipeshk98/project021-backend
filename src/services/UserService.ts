import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { User } from 'src/models/User';
import { Env } from 'src/utils/Env';

export class UserService {
  private dbClient: DynamoDB;

  private tableName: string;

  constructor(dbClient: DynamoDB) {
    this.dbClient = dbClient;
    this.tableName = Env.getValue('TABLE_NAME');
  }

  public async create(userId: string) {
    const user = new User(userId);

    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(user.toItem()),
          ConditionExpression:
            'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        })
        .promise();
    } catch (ex: any) {
      throw new ApiError('UserService: impossible to create', ex);
    }

    return user;
  }

  public async findByUserId(userId: string) {
    const user = new User(userId);

    try {
      const result = await this.dbClient
        .getItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall(user.keys()),
        })
        .promise();

      if (!result.Item) {
        return null;
      }

      user.fromItem(DynamoDB.Converter.unmarshall(result.Item));
    } catch (ex: any) {
      throw new ApiError('UserService: get operation impossible', ex);
    }

    return user;
  }

  public async findOrCreate(userId: string) {
    const user = await this.findByUserId(userId);

    if (!user) {
      return this.create(userId);
    }

    return user;
  }

  public async strictFindByUserId(userId: string) {
    const user = await this.findByUserId(userId);

    if (!user) {
      throw new ApiError(
        `Incorrect UserID ${userId}`,
        null,
        ErrorCode.INCORRECT_USER_ID
      );
    }

    return user;
  }

  public async findAndVerifyTeam(userId: string, teamId: string) {
    const user = await this.strictFindByUserId(userId);

    if (!user.isTeamMember(teamId)) {
      throw new ApiError(
        `User ${userId} isn't a team member of ${teamId}`,
        null,
        ErrorCode.NOT_MEMBER
      );
    }

    return user;
  }

  public async update(user: User) {
    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(user.toItem()),
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
