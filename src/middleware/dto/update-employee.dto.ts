import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../errors/ErrorHandler';

export const updateEmployeeDto = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      !req.body.hasOwnProperty('first_name') ||
      !req.body.hasOwnProperty('last_name') ||
      !req.body.hasOwnProperty('phone') ||
      !req.body.hasOwnProperty('nick_names')
    ) {
      throw new ErrorHandler(400, 'Invalid data transfer object');
    }
    if (typeof req.body.first_name !== 'string') {
      throw new ErrorHandler(400, 'first_name property must be string type');
    }
    if (typeof req.body.last_name !== 'string') {
      throw new ErrorHandler(400, 'last_name property must be string type');
    }
    if (typeof req.body.phone !== 'string') {
      throw new ErrorHandler(400, 'property property must be string type');
    }
    if (typeof req.body.nick_names !== 'object') {
      throw new ErrorHandler(400, 'nick_names property must be object type');
    }
    if (req.body.first_name.length > 100 || req.body.last_name.length < 3) {
      throw new ErrorHandler(400, 'first_name property maximum length is 100 and minimum 3');
    }
    if (req.body.last_name.length > 100 || req.body.last_name.length < 3) {
      throw new ErrorHandler(400, 'last_name property maximum lenght is 100 and minimum 3');
    }
    if (req.body.phone.length > 50 || req.body.phone.length < 5) {
      throw new ErrorHandler(400, 'phone property maximum lenght is 50 and minimum 5');
    }
    if (!req.body.nick_names.length) {
      throw new ErrorHandler(400, 'nick_names property must have at least one nick name');
    }

    next();
  } catch (error) {
    next(error);
  }
};
