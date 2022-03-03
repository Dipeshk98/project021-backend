import AWS from 'aws-sdk';

export class EmailService {
  private client: AWS.SES;

  constructor() {
    this.client = new AWS.SES({
      endpoint: 'http://localhost:9001',
    });
  }

  send() {
    return this.client
      .sendEmail({
        Destination: {
          ToAddresses: ['test@gmail.com'],
        },
        Message: {
          Body: {
            Html: {
              Data: 'STRING_VALUE',
            },
            Text: {
              Data: 'STRING_VALUE',
            },
          },
          Subject: {
            Data: 'STRING_VALUE',
          },
        },
        Source: 'origin@gmail.com',
      })
      .promise();
  }
}
