import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';

export const validateMongoId = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (isValidObjectId(req.params.id)) next();
    else {
      new ErrorHandler(400, 'Not valid mongo id');
    }
  } catch (error) {
    next(error);
  }
};
