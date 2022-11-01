/**
 * All database models are extended from AbstractModel
 */
export abstract class AbstractModel<T> {
  /**
   * Returns Primary keys.
   */
  abstract keys(): object;

  /**
   * Returns Prisma model with Primary keys.
   */
  abstract toCreateEntity(): object;

  /**
   * Convert to Prisma model without Primary keys.
   */
  abstract toEntity(): object;

  /**
   * Map Prisma model to class attributes.
   * @param item - The item returned by Prisma which need to convert to class attributes.
   */
  abstract fromEntity(item: T): void;
}
