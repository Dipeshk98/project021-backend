import httpMocks from 'node-mocks-http';
import { z } from 'zod';

import { validateRequest } from './Validation';

describe('Validation middleware', () => {
  describe('Test validateRequest', () => {
    it('should call `next` function', () => {
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/',
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      const validate = validateRequest({});
      validate(request, response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  it('should throw an exception with an incorrect params', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/',
    });
    const response = httpMocks.createResponse();
    const next = jest.fn();

    const validate = validateRequest<any>({
      params: z.object({
        teamId: z.string().nonempty(),
      }),
    });

    expect(() => validate(request, response, next)).toThrow(
      expect.objectContaining({
        message: 'Error in request validation',
        errorList: [{ param: 'teamId', type: 'invalid_type' }],
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and test `params` without errors', () => {
    const request = httpMocks.createRequest({
      method: 'GET',
      url: '/',
      params: {
        teamId: 'team-123',
      },
    });
    const response = httpMocks.createResponse();
    const next = jest.fn();

    const validate = validateRequest<any>({
      params: z.object({
        teamId: z.string().nonempty(),
      }),
    });

    validate(request, response, next);

    expect(next).toHaveBeenCalled();
  });
});
