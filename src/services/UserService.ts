import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { User } from 'src/models/User';
import { ISubscription } from 'src/types/StripeTypes';
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
    } catch (ex) {
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
    } catch (ex) {
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
    } catch (e) {
      if (e.code === 'ConditionalCheckFailedException') {
        return false;
      }

      throw new ApiError('DBClient error: "update" operation impossible', e);
    }
  }

  public async updateSubscription(userId: string, subscription: ISubscription) {
    try {
      await this.dbClient
        .updateItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall({
            PK: `${User.BEGINS_KEYS}${userId}`,
            SK: `${User.BEGINS_KEYS}${userId}`,
          }),
          UpdateExpression: 'SET subscription = :subscription',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':subscription': subscription,
          }),
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        })
        .promise();

      return true;
    } catch (e) {
      if (e.code === 'ConditionalCheckFailedException') {
        return false;
      }

      throw new ApiError('DBClient error: "update" operation impossible', e);
    }
  }
}
