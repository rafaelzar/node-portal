import { NextFunction, Request, Response } from 'express';
import { Employee, Location, Review, Mention } from 'eyerate';
import EmployeeModel from './models/EmployeesModel';
import { Model, Types } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';
import LocationModel from './models/MentionModel';
import ReviewModel from './models/ReviewsModel';
import MentionModel from './models/MentionModel';

class EmployeesController {
  constructor(
    private employeeModel: Model<Employee>,
    private mentionModel: Model<Mention>,
    private reviewModel: Model<Review>,
  ) {}

  async validateJwt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ErrorHandler(404, 'Cognito user not found');
      const user = await this.employeeModel.findOne({ email: req.user.email });
      if (!user) throw new ErrorHandler(404, 'Employee not found');
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.employeeModel.findOneAndUpdate({ email: req.params.id }, req.body, { new: true });
      if (!user) throw new ErrorHandler(404, 'Employee not updated');
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async averageStarRating(req: Request, res: Response, next: NextFunction) {
    try {
      const queryPlatform = JSON.parse(req.query.platform as string);
      const mentions = await this.mentionModel.find({ employee: Types.ObjectId(req.params.id) });
      if (!mentions.length) throw new ErrorHandler(404, 'Mentions for employee not found');
      const mentionIds = mentions.map((mention) => {
        const mentionObj = mention.toObject();
        return mentionObj.review;
      });
      const reviews = await this.reviewModel.find({
        _id: { $in: mentionIds },
        platform: { $in: queryPlatform },
        created_at: this.queryDate(req),
      });
      let sumReview = 0;
      for (const review of reviews) {
        const reviewObj = review.toObject();
        sumReview += reviewObj.rating;
      }
      const averageRating = sumReview / reviews.length;
      res.send({ averageRating });
    } catch (error) {
      next(error);
    }
  }

  queryDate(req: Request) {
    if (!req.query.startDate && !req.query.endDate) {
      return {
        $lt: new Date(),
      };
    }

    if (req.query.startDate && !req.query.endDate) {
      const startDate = new Date(req.query.startDate as string);
      if (startDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }
      return {
        $gt: startDate,
      };
    }

    if (!req.query.startDate && req.query.endDate) {
      const endDate = new Date(req.query.endDate as string);
      if (endDate.toString() === 'Invalid Date') {
        throw new ErrorHandler(422, 'Invalid date');
      }
      return {
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
      return {
        $gt: startDate,
        $lt: endDate,
      };
    }
  }
}

export = new EmployeesController(EmployeeModel, MentionModel, ReviewModel);
