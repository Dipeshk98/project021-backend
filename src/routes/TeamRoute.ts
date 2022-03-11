import { Router } from 'express';
import { teamController } from 'src/controllers';
import {
  bodyTeamNameValidate,
  paramsTeamIdValidate,
} from 'src/validations/TeamValidation';

const teamRouter = Router();

teamRouter.get(
  '/team/:teamId/list-members',
  paramsTeamIdValidate,
  teamController.listMembers
);

teamRouter.put(
  '/team/:teamId/name',
  bodyTeamNameValidate,
  teamController.updateDisplayName
);

export { teamRouter };
