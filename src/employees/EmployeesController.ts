import { NextFunction, Request, Response } from 'express';
import { Employee, Location, Review, Mention, Conversation } from 'eyerate';
import EmployeeModel from './models/EmployeesModel';
import { Model, Types } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';
import LocationModel from './models/MentionModel';
import ReviewModel from './models/ReviewsModel';
import MentionModel from './models/MentionModel';
import ConversationModel from './models/ConversationModels';

class EmployeesController {
  constructor(
    private employeeModel: Model<Employee>,
    private mentionModel: Model<Mention>,
    private reviewModel: Model<Review>,
    private conversationModel: Model<Conversation>,
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
      const user = await this.employeeModel.findOneAndUpdate(
        { _id: Types.ObjectId(req.params.id) },
        {
          $set: {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone: req.body.phone,
            nick_names: req.body.nick_names,
          },
        },
        { new: true },
      );
      if (!user) throw new ErrorHandler(404, 'Employee not updated');
      res.send(user);
    } catch (error) {
      next(error);
    }
  }

  async averageRatingNonEyerate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.queryObj) throw new ErrorHandler(422, 'Query object not provided');
      const queryObj = {
        $and: req.queryObj.$and.filter((obj: any) => obj.hasOwnProperty('platform') || obj.hasOwnProperty('date')),
      };
      const mentions = await this.mentionModel.find({
        employee: Types.ObjectId(req.params.id),
      });
      if (!mentions.length) throw new ErrorHandler(404, 'Mentions for employee not found');
      queryObj.$and.push({ _id: { $in: mentions.map((mention) => mention.toObject().review) } });
      const reviews = await this.reviewModel.find(queryObj);
      if (!reviews.length) throw new ErrorHandler(404, 'Reviews for employee not found');
      return this.starsAndRating(reviews);
    } catch (error) {
      next(error);
    }
  }

  async averageRatingEyerate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.queryObj) throw new ErrorHandler(422, 'Query object not provided');
      const queryObj = {
        $and: req.queryObj.$and.filter((obj: any) => obj.hasOwnProperty('created_at')),
      };
      queryObj.$and.push({ employee: Types.ObjectId(req.params.id) }, { rating: { $ne: null } });
      const conversations = await this.conversationModel.find(queryObj);
      if (!conversations.length) throw new ErrorHandler(404, 'Conversation for employee with given query not found');
      return this.starsAndRating(conversations);
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const queryObj = req.queryObj as any;
      const sort = req.query.sort as string;
      const eyerate = req.query.eyerate;
      const sortBy = req.query.sortBy as string;
      const page = parseInt(req.query.page as string);
      const size = 5;

      const userId = req.params.id;
      const mentions = await this.mentionModel.find({ employee: Types.ObjectId(userId) }, { review: 1, _id: 0 });
      const reviewIds = mentions.map((el) => el.toObject().review);

      queryObj.$and.push({ _id: { $in: reviewIds } });

      const reviewCount = await this.reviewModel.find(queryObj).countDocuments();
      const reviews = await this.reviewModel
        .find(queryObj)
        .sort({ [sortBy]: sort })
        .select('date content rating platform author')
        .skip((page - 1) * size)
        .limit(size);
      console.log(reviews);

      res.send({ data: reviews, pageCount: Math.floor(reviewCount / size) + 1 });
    } catch (error) {
      next(error);
    }
  }

  // helper methods

  starsAndRating(documentArray: any[]) {
    let sumReview = 0;
    let star5 = 0;
    let star4 = 0;
    let star3 = 0;
    let star2 = 0;
    let star1 = 0;
    let Weedmaps = 0;
    let Yelp = 0;
    let Google = 0;
    let GMB = 0;
    for (const documentObj of documentArray) {
      if (documentObj.toObject().hasOwnProperty('platform')) {
        if (documentObj.toObject().platform === 'Weedmaps') Weedmaps++;
        if (documentObj.toObject().platform === 'Yelp') Yelp++;
        if (documentObj.toObject().platform === 'Google') Google++;
        if (documentObj.toObject().platfrom === 'GMB') GMB++;
      }
      if (documentObj.toObject().rating === 5) star5++;
      if (documentObj.toObject().rating === 4) star4++;
      if (documentObj.toObject().rating === 3) star3++;
      if (documentObj.toObject().rating === 2) star2++;
      if (documentObj.toObject().rating === 1) star1++;
      sumReview += documentObj.toObject().rating;
    }
    const starsData = [
      { stars: 5, percent: Math.round((star5 / documentArray.length) * 100), number: star5 },
      { stars: 4, percent: Math.round((star4 / documentArray.length) * 100), number: star4 },
      { stars: 3, percent: Math.round((star3 / documentArray.length) * 100), number: star3 },
      { stars: 2, percent: Math.round((star2 / documentArray.length) * 100), number: star2 },
      { stars: 1, percent: Math.round((star1 / documentArray.length) * 100), number: star1 },
    ];
    const chartData = [Weedmaps, Yelp, Google, GMB];
    const averageRating = sumReview / documentArray.length;
    return { averageRating, starsData, chartData };
  }
}

export = new EmployeesController(EmployeeModel, MentionModel, ReviewModel, ConversationModel);
