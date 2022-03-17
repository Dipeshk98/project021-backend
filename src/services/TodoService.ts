import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { Todo } from 'src/models/Todo';
import { Env } from 'src/utils/Env';

export class TodoService {
  private dbClient: DynamoDB;

  private tableName: string;

  constructor(dbClient: DynamoDB) {
    this.dbClient = dbClient;
    this.tableName = Env.getValue('TABLE_NAME');
  }

  async save(todo: Todo) {
    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(todo.toItem()),
          ConditionExpression:
            'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        })
        .promise();
    } catch (ex: any) {
      throw new ApiError('DBClient error: operation impossible', ex);
    }
  }

  public async findByKeys(userId: string, id: string) {
    const todo = new Todo(userId, id);

    try {
      const result = await this.dbClient
        .getItem({
          TableName: this.tableName,
          Key: DynamoDB.Converter.marshall(todo.keys()),
        })
        .promise();

      if (!result.Item) {
        return null;
      }

      todo.fromItem(DynamoDB.Converter.unmarshall(result.Item));
    } catch (ex: any) {
      throw new ApiError('DBClient error: operation impossible', ex);
    }

    return todo;
  }

  public async delete(userId: string, id: string) {
    const todo = new Todo(userId, id);

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
      throw new ApiError('DBClient error: operation impossible', e);
    }
  }

  public async update(todo: Todo) {
    try {
      await this.dbClient
        .putItem({
          TableName: this.tableName,
          Item: DynamoDB.Converter.marshall(todo.toItem()),
          ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
        })
        .promise();

      return true;
    } catch (e: any) {
      if (e.code === 'ConditionalCheckFailedException') {
        return false;
      }

      throw new ApiError('DBClient error: operation impossible', e);
    }
  }

  public async findAllByUserId(userId: string) {
    try {
      const list = await this.dbClient
        .query({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skBegins)',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':pk': `${Todo.BEGINS_KEYS}${userId}`,
            ':skBegins': Todo.BEGINS_KEYS,
          }),
        })
        .promise();

      if (!list.Items) {
        return [];
      }

      return list.Items.map((elt) => {
        const item = DynamoDB.Converter.unmarshall(elt);
        const todo = new Todo(userId, item.SK, true);
        todo.fromItem(item);
        return todo;
      });
    } catch (e: any) {
      throw new ApiError('DBClient error: operation impossible', e);
    }
  }
}
