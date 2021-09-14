import { RequestHandler } from 'express';
import ErrorHandler from '../errors/ErrorHandler';

export const validateDate: RequestHandler = async (req, res, next) => {
  try {
    const queryObj = { $and: [] } as any;

    if (!req.query.startDate && !req.query.endDate) {
      queryObj.$and.push({ date: { $lt: new Date() } });
    }

    if (req.query.startDate && !req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      if (startDate.toString() === 'Invalid Date') throw new ErrorHandler(422, 'Invalid date');
      queryObj.$and.push({ date: { $gt: startDate } });
    }

    if (!req.query.startDate && req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') throw new ErrorHandler(422, 'Invalid date');
      queryObj.$and.push({ date: { $lt: endDate } });
    }

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date')
        throw new ErrorHandler(422, 'Invalid date');
      if (startDate > endDate) throw new ErrorHandler(422, 'Start date must happen before end date');
      endDate.setHours(endDate.getHours() + 24);
      queryObj.$and.push({ date: { $gt: startDate, $lt: endDate } });
    }

    req.queryObj = queryObj;

    next();
  } catch (error) {
    next(error);
  }
};
