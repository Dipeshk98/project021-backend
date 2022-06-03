import { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import { RequestError } from '@/error/RequestError';
import { captureException, captureMessage } from '@/utils/Logging';

/**
 * Handling 404 error not found.
 */
export const handler404 = (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  captureMessage(ErrorCode.NOT_FOUND);
  res.status(404).json({ errors: ErrorCode.NOT_FOUND });
};

/**
 * Global error handling for all applications.
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof RequestError) {
    res.status(400).json({
      errors: err.errorList,
    });
  } else if (err instanceof ApiError) {
    captureException(err);
    res.status(500).json({ errors: err.publicErrorCode });
  } else {
    captureException(err);
    res.status(500).json({ errors: ErrorCode.INTERNAL_SERVER_ERROR });
  }
};
