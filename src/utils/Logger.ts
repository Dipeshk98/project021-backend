import pino from 'pino';
import { lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda';

const destination = pinoLambdaDestination();
export const logger = pino(
  { base: undefined, level: process.env.PINO_LOG_LEVEL || 'info' },
  destination
);
export const withRequest = lambdaRequestTracker();
