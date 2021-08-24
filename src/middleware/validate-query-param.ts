import { NextFunction, Response, Request } from 'express';
import ErrorHandler from '../errors/ErrorHandler';

export const validateQueryParam = (req: Request, _: Response, next: NextFunction) => {
  try {
    const queryObj = { $and: [] } as any;

    if (req.query.platform) {
      const { platform } = req.query;
      const platofrmTypes = ['Weedmaps', 'Yelp', 'Google', 'GMB', 'Eyerate'];
      if (!platofrmTypes.includes(platform as string))
        throw new ErrorHandler(400, 'Platform must match one of the following Weedmaps, Yelp, Google, GMB or Eyerate');
      if (platform !== 'Eyerate') queryObj.$and.push({ platform: platform });
    }

    if (!req.query.startDate && !req.query.endDate) {
      queryObj.$and.push({ date: { $lt: new Date() } });
      queryObj.$and.push({ created_at: { $lt: new Date() } });
    }

    if (req.query.startDate && !req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      if (startDate.toString() === 'Invalid Date') throw new ErrorHandler(422, 'Invalid date');
      queryObj.$and.push({ date: { $gt: startDate } });
      queryObj.$and.push({ created_at: { $gt: startDate } });
    }

    if (!req.query.startDate && req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') throw new ErrorHandler(422, 'Invalid date');
      queryObj.$and.push({ date: { $lt: endDate } });
      queryObj.$and.push({ created_at: { $lt: endDate } });
    }

    if (req.query.startDate && req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      if (startDate.toString() === 'Invalid Date' || endDate.toString() === 'Invalid Date')
        throw new ErrorHandler(422, 'Invalid date');
      if (startDate > endDate) throw new ErrorHandler(422, 'Start date must happen before end date');
      endDate.setHours(endDate.getHours() + 24);
      queryObj.$and.push({ date: { $gt: startDate, $lt: endDate } });
      queryObj.$and.push({ created_at: { $gt: startDate, $lt: endDate } });
    }
    if (req.query.firstDate) {
      const firstDate = new Date(req.query.firstDate as string);
      if (firstDate.toString() === 'Invalid Date') throw new ErrorHandler(400, 'Invalid date for firstDate');
    }
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') throw new ErrorHandler(400, 'Invalid date for endDate');
    }

    if (req.query.rating) {
      const rating = Number(req.query.rating);
      if (isNaN(rating)) throw new ErrorHandler(400, 'Rating must be a number');
      queryObj.$and.push({ rating: { $eq: rating } });
    }

    if (req.query.keyword) {
      const keyword = req.query.keyword as string;
      const key = keyword.split('%20').join(' ');
      queryObj.$and.push({ content: { $regex: key, $options: 'i' } });
    }

    if (req.query.eyerate) {
      const eyerate = req.query.eyerate;
      if (!(eyerate === 'true' || eyerate === 'false'))
        throw new ErrorHandler(400, 'Eyerate must be either true or false');
    }

    const { sort } = req.query;
    if (!sort) throw new ErrorHandler(400, 'Sort must be either desc or asc');

    if (sort && !(sort === 'desc' || sort === 'asc')) {
      throw new ErrorHandler(400, 'Sort must be either desc or asc');
    }

    if (req.query.lastDate && !(req.query.cursor == 'left' || req.query.cursor == 'right'))
      throw new ErrorHandler(400, 'Cursors must be either left or right');

    const { cursor } = req.query;

    if (req.query.lastDate && cursor === 'right' && sort === 'asc') {
      const lastDate = new Date(req.query.lastDate as string);
      queryObj.$and = queryObj.$and.map((obj: any) => {
        if (Object.keys(obj).includes('date')) obj.date.$gt = lastDate;
        if (Object.keys(obj).includes('created_at')) obj['created_at'].$gt = lastDate;
        return obj;
      });
    }

    if (req.query.firstDate && cursor === 'left' && sort === 'asc') {
      const firstDate = new Date(req.query.firstDate as string);
      queryObj.$and = queryObj.$and.map((obj: any) => {
        if (Object.keys(obj).includes('date')) obj.date.$lt = firstDate;
        if (Object.keys(obj).includes('created_at')) obj['created_at'].$lt = firstDate;
        return obj;
      });
    }

    if (req.query.lastDate && cursor === 'right' && sort === 'desc') {
      const lastDate = new Date(req.query.lastDate as string);
      queryObj.$and = queryObj.$and.map((obj: any) => {
        if (Object.keys(obj).includes('date')) obj.date.$lt = lastDate;
        if (Object.keys(obj).includes('created_at')) obj['created_at'].$lt = lastDate;
        return obj;
      });
    }

    if (req.query.firstDate && cursor === 'left' && sort === 'desc') {
      const firstDate = new Date(req.query.firstDate as string);
      queryObj.$and = queryObj.$and.map((obj: any) => {
        if (Object.keys(obj).includes('date')) obj.date.$gt = firstDate;
        if (Object.keys(obj).includes('created_at')) obj['created_at'].$gt = firstDate;
        return obj;
      });
    }

    req.queryObj = queryObj;
    next();
  } catch (error) {
    next(error);
  }
};
