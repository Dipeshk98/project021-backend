import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { Member } from 'src/models/Member';
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
        const todo = new Member(teamId, item.SK, true);
        todo.fromItem(item);
        return todo;
      });
    } catch (e: any) {
      throw new ApiError('DBClient error: "list" operation impossible', e);
    }
  }
}
