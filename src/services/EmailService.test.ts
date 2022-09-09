import { mockSendMail } from '__mocks__/nodemailer';

import { TestEmailTemplate } from '@/emails/TestEmailTemplate';

import { EmailService } from './EmailService';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  describe('Send email', () => {
    it('should able to send email to the correct email', async () => {
      await emailService.send(new TestEmailTemplate(), 'user@example.com');

      expect(mockSendMail).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test email subject',
          text: 'Test email text',
        })
      );
    });
  });
});
