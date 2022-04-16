import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import { AbstractEmailTemplate } from 'src/emails/AbstractEmailTemplate';
import { Env } from 'src/utils/Env';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    let sesOptions = {};

    if (Env.getValue('IS_OFFLINE', false)) {
      sesOptions = {
        endpoint: 'http://localhost:9001',
      };
    }

    this.transporter = nodemailer.createTransport({
      SES: new AWS.SES(sesOptions),
    });
  }

  send(template: AbstractEmailTemplate, email: string) {
    return this.transporter.sendMail({
      from: {
        name: Env.getValue('SITE_NAME'),
        address: Env.getValue('SENDER_EMAIL_ADDRESS'),
      },
      to: email,
      subject: template.buildSubject(),
      text: template.buildText(),
    });
  }
}
