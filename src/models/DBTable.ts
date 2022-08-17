import { Table } from 'dynamodb-onetable';

import { getDBClient } from '@/utils/DBClient';
import { Env } from '@/utils/Env';

import { schema } from './Schema';

let dbTable: Table | null = null;

/**
 * Singleton for holding the connection to DynamoDB and the data schema.
 * The entry point to the ORM-equivalent for DynamoDB.
 */
export const getDBTable = () => {
  if (!dbTable) {
    dbTable = new Table({
      client: getDBClient(),
      name: Env.getValue('TABLE_NAME'),
      schema,
    });
  }

  return dbTable;
};
