import { Router } from 'express';
import { teamController } from 'src/controllers';
import {
  bodyCreateTeamValidate,
  bodyTeamNameValidate,
  paramsTeamIdValidate,
} from 'src/validations/TeamValidation';

const teamRouter = Router();

teamRouter.post('/team/create', bodyCreateTeamValidate, teamController.create);

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

teamRouter.delete('/team/:teamId', paramsTeamIdValidate, teamController.delete);

teamRouter.get(
  '/team/:teamId/settings',
  paramsTeamIdValidate,
  teamController.getSettings
);

export { teamRouter };
