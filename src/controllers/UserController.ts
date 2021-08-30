import { RequestHandler } from 'express';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { BillingService } from 'src/services/BillingService';
import { UserService } from 'src/services/UserService';

export class UserController {
  private billingService: BillingService;

  private userService: UserService;

  constructor(userService: UserService, billingService: BillingService) {
    this.userService = userService;
    this.billingService = billingService;
  }

  /**
   * Retrieve User information or create a new User, it happens when the user signs in for the first time.
   */
  public getProfile: RequestHandler = async (req, res) => {
    const user = await this.userService.findOrCreate(req.currentUserId);

    res.json({
      id: user.getId(),
      firstSignIn: user.getFirstSignIn().toISOString(),
    });
  };

  public getSettings: RequestHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    const plan = this.billingService.getPlanFromSubscription(
      user.getSubscription()
    );

    res.json({
      planId: plan.id,
      planName: plan.name,
      hasStripeCustomerId: user.hasStripeCustomerId(),
    });
  };
}
