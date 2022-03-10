import { validateRequest } from 'src/middlewares/Validation';
import { z } from 'zod';

export const bodyTeamNameValidate = validateRequest({
  params: z.object({
    teamId: z.string(),
  }),
  body: z.object({
    displayName: z.string().nonempty(),
  }),
});

export type BodyTeamNameHandler = typeof bodyTeamNameValidate;
