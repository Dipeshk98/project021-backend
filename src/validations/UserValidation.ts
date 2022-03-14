import { validateRequest } from 'src/middlewares/Validation';
import { z } from 'zod';

export const paramsEmailValidate = validateRequest({
  query: z.object({
    email: z.string(),
  }),
});

export type ParamsEmailHandler = typeof paramsEmailValidate;

export const bodyEmailValidate = validateRequest({
  body: z.object({
    email: z.string(),
  }),
});

export type BodyEmailHandler = typeof bodyEmailValidate;
