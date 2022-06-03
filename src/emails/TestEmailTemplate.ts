/* eslint-disable class-methods-use-this */
import { AbstractEmailTemplate } from './AbstractEmailTemplate';

/**
 * Email template only use for testing.
 */
export class TestEmailTemplate extends AbstractEmailTemplate {
  public buildSubject(): string {
    return `Test email subject`;
  }

  public buildText(): string {
    return `Test email text`;
  }
}
