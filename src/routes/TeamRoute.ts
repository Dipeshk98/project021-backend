import { Router } from 'express';
import { teamController } from 'src/controllers';
import { bodyTeamNameValidate } from 'src/validations/TeamValidation';

const teamRouter = Router();

teamRouter.put(
  '/team/:teamId/name',
  bodyTeamNameValidate,
  teamController.updateDisplayName
);

export { teamRouter };
