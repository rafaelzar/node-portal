import { NextFunction, Response, Request } from 'express';
import ErrorHandler from '../errors/ErrorHandler';

export const validateQueryParam = (req: Request, _: Response, next: NextFunction) => {
  try {
    if (!req.query.platform) req.query.platform = JSON.stringify(['Weedmaps', 'Yelp', 'Google', 'GMB']);
    else {
      const platform = req.query.platform as string;
      if (platform.indexOf(',') > -1) {
        const arr = platform.split(',');
        req.query.platform = JSON.stringify(arr);
      } else {
        req.query.platform = JSON.stringify([platform]);
      }
    }

    let date = {};

    if (!req.query.startDate && !req.query.endDate) {
      date = {
        $lt: new Date(),
      };
    }

    if (req.query.startDate && !req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      if (startDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }
      date = {
        $gt: startDate,
      };
    }

    if (!req.query.startDate && req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }
      date = {
        $lt: endDate,
      };
    }

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }
      if (startDate > endDate) {
        throw new ErrorHandler(422, 'Start date must happen before end date');
      }
      date = {
        $gt: startDate,
        $lt: endDate,
      };
    }

    req.date = date;
    next();
  } catch (error) {
    next(error);
  }
};
