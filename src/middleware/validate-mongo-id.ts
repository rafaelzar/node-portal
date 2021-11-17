import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';

export const validateMongoId = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.params.id) throw new ErrorHandler(422, 'Include id param in request');
    if (!isValidObjectId(req.params.id)) throw new ErrorHandler(400, 'Not valid id');
    next();
  } catch (error) {
    next(error);
  }
};
