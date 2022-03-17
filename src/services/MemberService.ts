import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { Member } from 'src/models/Member';
import { User } from 'src/models/User';
import { Env } from 'src/utils/Env';

export class MemberService {
  private dbClient: DynamoDB;

  private tableName: string;

  constructor(dbClient: DynamoDB) {
    this.dbClient = dbClient;
    this.tableName = Env.getValue('TABLE_NAME');
  }

  async save(member: Member) {
    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(member.toItem()),
          ConditionExpression:
            'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        })
        .promise();
    } catch (ex: any) {
      throw new ApiError('TodoService: impossible to create', ex);
    }
  }

  public async delete(teamId: string, userId: string) {
    const member = new Member(teamId, userId);

    try {
      const result = await this.dbClient
        .deleteItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall(member.keys()),
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

  public async deleteAllMembers(teamId: string) {
    try {
      const list = await this.findAllByTeamId(teamId);
      let result = true;

      // `deleteItem` can only delete one by one
      for (let i = 0; i < list.length; i += 1) {
        const elt = list[i];

        if (!elt) {
          throw new ApiError("It shouldn't happen");
        }

        // Just run it sequentially, less performant but don't use all the DynamoDB capacity
        // eslint-disable-next-line no-await-in-loop
        const tmpResult = await this.dbClient
          .deleteItem({
            TableName: this.tableName,
            Key: DynamoDB.Converter.marshall(elt.keys()),
            ReturnValues: 'ALL_OLD',
          })
          .promise();

        result = result && !!tmpResult.Attributes;
      }

      return result;
    } catch (e: any) {
      throw new ApiError('DBClient error: "remove" operation impossible', e);
    }
  }

  public async findAllByTeamId(teamId: string) {
    try {
      const list = await this.dbClient
        .query({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skBegins)',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':pk': `${Member.BEGINS_KEYS}${teamId}`,
            ':skBegins': Member.BEGINS_KEYS,
          }),
        })
        .promise();

      if (!list.Items) {
        return [];
      }

      return list.Items.map((elt) => {
        const item = DynamoDB.Converter.unmarshall(elt);
        const member = new Member(teamId, item.SK, true);
        member.fromItem(item);
        return member;
      });
    } catch (e: any) {
      throw new ApiError('DBClient error: "list" operation impossible', e);
    }
  }

  public async updateEmail(user: User, email: string) {
    const teamList = user.getTeamList();

    try {
      // run sequentially (not in parallel) with classic loop, `forEach` is not designed for asynchronous code.
      for (let i = 0; i < teamList.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await this.dbClient
          .updateItem({
            TableName: this.tableName,
            Key: DynamoDB.Converter.marshall({
              PK: `${Member.BEGINS_KEYS}${teamList[i]}`,
              SK: `${Member.BEGINS_KEYS}${user.getId()}`,
            }),
            UpdateExpression: 'SET email = :email',
            ExpressionAttributeValues: DynamoDB.Converter.marshall({
              ':email': email,
            }),
            ConditionExpression:
              'attribute_exists(PK) AND attribute_exists(SK)',
          })
          .promise();
      }
    } catch (ex: any) {
      throw new ApiError('TeamService: impossible to update email', ex);
    }
  }
}
