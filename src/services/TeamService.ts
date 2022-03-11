import { DynamoDB } from 'aws-sdk';
import { ApiError } from 'src/error/ApiError';
import { Team } from 'src/models/Team';
import { Env } from 'src/utils/Env';

export class TeamService {
  private dbClient: DynamoDB;

  private tableName: string;

  constructor(dbClient: DynamoDB) {
    this.dbClient = dbClient;
    this.tableName = Env.getValue('TABLE_NAME');
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
}
