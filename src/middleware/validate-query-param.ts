import { NextFunction, Response, Request } from 'express';
import ErrorHandler from '../errors/ErrorHandler';

export const validateQueryParam = (req: Request, _: Response, next: NextFunction) => {
  try {
    const queryObj = { $and: [] } as any;

    if (!req.query.platform) queryObj.$and.push({ platform: { $in: ['Weedmaps', 'Yelp', 'Google', 'GMB'] } });
    else {
      const platform = req.query.platform as string;
      if (platform.indexOf(',') > -1) {
        const arr = platform.split(',');

        queryObj.$and.push({ platform: { $in: arr } });
      } else {
        queryObj.$and.push({ platform: { $in: [platform] } });
      }
    }

    if (!req.query.startDate && !req.query.endDate) {
      queryObj.$and.push({ date: { $lt: new Date() } });
    }

    if (req.query.startDate && !req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      if (startDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }

      queryObj.$and.push({
        date: { $gt: startDate },
      });
    }

    if (!req.query.startDate && req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }
      queryObj.$and.push({
        date: { $lt: endDate },
      });
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
      queryObj.$and.push({
        date: { $gt: startDate, $lt: endDate },
      });
    }
    if (req.query.rating) {
      const rating = Number(req.query.rating);
      if (isNaN(rating)) throw new ErrorHandler(400, 'Rating must be a number');
      queryObj.$and.push({
        rating: { $eq: rating },
      });
    }
    if (req.query.content) {
      const content = req.query.content;
      queryObj.$and.push({ content: { $regex: content, $options: 'i' } });
    }
    if (req.query.eyerate) {
      const eyerate = req.query.eyerate;
      if (!(eyerate === 'true' || eyerate === 'false')) {
        throw new ErrorHandler(400, 'Eyerate must be either true or false');
      }
    }
    const { sort, sortBy } = req.query;
    if (sort && sortBy) {
      if (!(sort === 'desc' || sort === 'asc')) {
        throw new ErrorHandler(400, 'Sort must be either desc or asc');
      }
      if (!(sortBy === 'date' || sortBy === 'rating')) {
        throw new ErrorHandler(400, 'SortBy must be either date or rating');
      }
    } else if ((!sort && sortBy) || (sort && !sortBy)) {
      throw new ErrorHandler(400, 'Both sort and sortBy params required');
    }
    req.queryObj = queryObj;
    next();
  } catch (error) {
    next(error);
  }
};
