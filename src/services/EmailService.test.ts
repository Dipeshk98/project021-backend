import { TestEmailTemplate } from '@/emails/TestEmailTemplate';

import { EmailService } from './EmailService';

const sendMailMock = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: sendMailMock,
  })),
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  it('should able to send email to the correct email', async () => {
    await emailService.send(new TestEmailTemplate(), 'user@example.com');

    expect(sendMailMock).toHaveBeenCalled();
    expect(sendMailMock).toBeCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
      })
    );
  });
});
