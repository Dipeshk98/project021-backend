import { validateRequest } from 'src/middlewares/Validation';
import { z } from 'zod';

export const bodyPriceValidate = validateRequest({
  body: z.object({
    priceId: z.string().nonempty(),
  }),
});

export type BodyPriceHandler = typeof bodyPriceValidate;
