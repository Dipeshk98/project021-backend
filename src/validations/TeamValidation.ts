import { validateRequest } from 'src/middlewares/Validation';
import { z } from 'zod';

export const bodyCreateTeamValidate = validateRequest({
  body: z.object({
    email: z.string(),
    displayName: z.string(),
  }),
});

export type BodyCreateTeamHandler = typeof bodyCreateTeamValidate;

export const paramsTeamIdValidate = validateRequest({
  params: z.object({
    teamId: z.string(),
  }),
});

export type ParamsTeamIdHandler = typeof paramsTeamIdValidate;

export const bodyTeamNameValidate = validateRequest({
  params: z.object({
    teamId: z.string(),
  }),
  body: z.object({
    displayName: z.string().nonempty(),
  }),
});

export type BodyTeamNameHandler = typeof bodyTeamNameValidate;
