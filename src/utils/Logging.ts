/* eslint-disable no-console */

import { ApiError } from 'src/error/ApiError';

// Tried several node logging system. None are work very well with Serverless.
// Either create a lot of overhead on Lambda or either doesn't integrate well in Cloudwatch.
// The best one for logging is still the default `console`.

export const log = (message: string) => {
  console.log(message);
};

export const info = (message: string) => {
  console.info(message);
};

export const warn = (message: string) => {
  console.warn(message);
};

// You can set up an alert system for captureMessage.
// Be notified when something goes wrong.
// If you want you can set up Programmatic Error with Lumigo:
// https://docs.lumigo.io/docs/programmatic-errors#configuring-a-generic-programmatic-error
export const captureMessage = (message: string) => {
  console.error(message);
};

// You can set up an alert system for captureMessage.
// Be notified when something goes wrong.
// If you want you can set up Programmatic Error with Lumigo:
// https://docs.lumigo.io/docs/programmatic-errors#configuring-a-generic-programmatic-error
export const captureException = (ex: any) => {
  let result = '';

  if (ex instanceof ApiError) {
    result += `[${ApiError.LOG_TAG}] `;
  }

  result += ex;

  console.error(result);
  console.error(ex);
};
