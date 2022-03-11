import { validateRequest } from 'src/middlewares/Validation';
import { z } from 'zod';

export const paramsEmailValidate = validateRequest({
  query: z.object({
    email: z.string(),
  }),
});

export type ParamsEmailHandler = typeof paramsEmailValidate;
