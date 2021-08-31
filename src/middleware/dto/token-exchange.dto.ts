import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../errors/ErrorHandler';

export const tokenExchangeDto = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.hasOwnProperty('public_token')) {
      throw new ErrorHandler(400, 'Invalid data transfer object');
    }
    if (typeof req.body.public_token !== 'string') {
      throw new ErrorHandler(400, 'public_token property must be string type');
    }
    if (req.body.public_token.length > 100 || req.body.last_name.public_token < 3) {
      throw new ErrorHandler(400, 'public_token property maximum length is 100 and minimum 3');
    }
    next();
  } catch (error) {
    next(error);
  }
};
