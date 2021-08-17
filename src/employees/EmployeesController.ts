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
      const queryDate = JSON.parse(req.query.date as string);
      const mentions = await this.mentionModel.find({ employee: Types.ObjectId(req.params.id) });
      if (!mentions.length) throw new ErrorHandler(404, 'Mentions for employee not found');
      const reviews = await this.reviewModel.find({
        _id: { $in: mentions.map((mention) => mention.review) },
        platform: { $in: queryPlatform },
        date: queryDate,
      });
      let sumReview = 0;
      for (const review of reviews) {
        sumReview += review.rating;
      }
      const averageRating = sumReview / reviews.length;
      res.send({ averageRating });
    } catch (error) {
      next(error);
    }
  }
}

export = new EmployeesController(EmployeeModel, MentionModel, ReviewModel);
