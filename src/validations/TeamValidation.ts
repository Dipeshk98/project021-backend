import { z } from 'zod';

import { validateRequest } from '@/middlewares/Validation';

export const bodyCreateTeamValidate = validateRequest({
  body: z.object({
    userEmail: z.string().nonempty().email(),
    displayName: z.string().nonempty(),
  }),
});

export type BodyCreateTeamHandler = typeof bodyCreateTeamValidate;

export const paramsTeamIdValidate = validateRequest({
  params: z.object({
    teamId: z.string().nonempty(),
  }),
});

export type ParamsTeamIdHandler = typeof paramsTeamIdValidate;

export const bodyTeamNameValidate = validateRequest({
  params: z.object({
    teamId: z.string().nonempty(),
  }),
  body: z.object({
    displayName: z.string().nonempty(),
  }),
});

export type BodyTeamNameHandler = typeof bodyTeamNameValidate;

export const bodyInviteValidate = validateRequest({
  params: z.object({
    teamId: z.string().nonempty(),
  }),
  body: z.object({
    email: z.string().nonempty().email(),
  }),
});

export type BodyInviteHandler = typeof bodyInviteValidate;

export const paramsJoinValidate = validateRequest({
  params: z.object({
    teamId: z.string().nonempty(),
    verificationCode: z.string().nonempty(),
  }),
});

export type ParamsJoinHandler = typeof paramsJoinValidate;

export const fullJoinValidate = validateRequest({
  params: z.object({
    teamId: z.string().nonempty(),
    verificationCode: z.string().nonempty(),
  }),
  body: z.object({
    email: z.string().nonempty().email(),
  }),
});

export type FullJoinHandler = typeof fullJoinValidate;

export const paramsRemoveValidate = validateRequest({
  params: z.object({
    teamId: z.string().nonempty(),
    memberId: z.string().nonempty(),
  }),
});

export type ParamsRemoveHandler = typeof paramsRemoveValidate;
