import { AbstractModel } from './AbstractModel';

type NotificationLogEntity = {
  id: string;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  message: string;
  status: string;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
};

export class NotificationLogModel extends AbstractModel<NotificationLogEntity> {
  public readonly id: string;
  private senderEmail: string;
  private senderName: string;
  private recipientEmail: string;
  private recipientName: string;
  private subject: string;
  private message: string;
  private status: string;
  private errorMessage: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    senderEmail: string,
    senderName: string,
    recipientEmail: string,
    recipientName: string,
    subject: string,
    message: string,
    status: string,
    errorMessage: string | null = null
  ) {
    super();
    this.id = id;
    this.senderEmail = senderEmail;
    this.senderName = senderName;
    this.recipientEmail = recipientEmail;
    this.recipientName = recipientName;
    this.subject = subject;
    this.message = message;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  keys() {
    return {
      id: this.id,
    };
  }

  toCreateEntity(): NotificationLogEntity {
    return {
      ...this.keys(),
      sender_email: this.senderEmail,
      sender_name: this.senderName,
      recipient_email: this.recipientEmail,
      recipient_name: this.recipientName,
      subject: this.subject,
      message: this.message,
      status: this.status,
      error_message: this.errorMessage,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  toEntity(): Omit<NotificationLogEntity, 'id' | 'created_at'> {
    return {
      sender_email: this.senderEmail,
      sender_name: this.senderName,
      recipient_email: this.recipientEmail,
      recipient_name: this.recipientName,
      subject: this.subject,
      message: this.message,
      status: this.status,
      error_message: this.errorMessage,
      updated_at: this.updatedAt,
    };
  }

  fromEntity(entity: NotificationLogEntity) {
    this.senderEmail = entity.sender_email;
    this.senderName = entity.sender_name;
    this.recipientEmail = entity.recipient_email;
    this.recipientName = entity.recipient_name;
    this.subject = entity.subject;
    this.message = entity.message;
    this.status = entity.status;
    this.errorMessage = entity.error_message;
    this.createdAt = entity.created_at;
    this.updatedAt = entity.updated_at;
  }
} 