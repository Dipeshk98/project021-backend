export type IDynamodbItem = { [key: string]: any };

export abstract class AbstractItem {
  /**
   * DynamoDB Partition key.
   */
  abstract get pk(): string;

  /**
   * DynamoDB Sort key.
   */
  abstract get sk(): string;

  /**
   * Returns DynamoDB Primary key.
   * @returns keys - Primary key.
   * @return PK - Partition key.
   * @return SK - Sort key.
   */
  public keys() {
    return {
      PK: this.pk,
      SK: this.sk,
    };
  }

  /**
   * Convert to DynamoDB item.
   */
  abstract toItem(): IDynamodbItem;

  /**
   * Map DynamoDB item to class attributes.
   * @param item - The item returned by DynamoDB which need to convert to class attributes.
   */
  abstract fromItem(item: IDynamodbItem): void;
}
