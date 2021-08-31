import { RequestHandler } from 'express';
import ErrorHandler from '../errors/ErrorHandler';

export const validateDate: RequestHandler = async (req, res, next) => {
  try {
    if (!req.query.startDate && !req.query.endDate) throw new ErrorHandler(422, 'Invalid date');

    if (req.query.startDate && !req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      if (startDate.toString() === 'Invalid Date') throw new ErrorHandler(422, 'Invalid date');
    }

    if (!req.query.startDate && req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') throw new ErrorHandler(422, 'Invalid date');
    }

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date')
        throw new ErrorHandler(422, 'Invalid date');
      if (startDate > endDate) throw new ErrorHandler(422, 'Start date must happen before end date');
    }
  } catch (error) {
    next(error);
  }
};
