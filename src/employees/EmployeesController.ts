import { NextFunction, Request, Response } from 'express';
import { Employee, Location, Review, Mention, Conversation, Customer } from 'eyerate';
import EmployeeModel from './models/EmployeesModel';
import { Model, Types } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';
import LocationModel from './models/MentionModel';
import ReviewModel from './models/ReviewsModel';
import MentionModel from './models/MentionModel';
import ConversationModel from './models/ConversationModels';
import CustomerModel from './models/CustomerModel';

class EmployeesController {
  constructor(
    private employeeModel: Model<Employee>,
    private mentionModel: Model<Mention>,
    private reviewModel: Model<Review>,
    private conversationModel: Model<Conversation>,
    private customerModel: Model<Customer>,
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
      const queryObj = {
        $and: req.queryObj?.$and.filter((obj: any) => obj.hasOwnProperty('platform') || obj.hasOwnProperty('date')),
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
      const queryObj = {
        $and: req.queryObj?.$and.filter((obj: any) => obj.hasOwnProperty('created_at')),
      };
      queryObj.$and.push({ employee: Types.ObjectId(req.params.id) }, { rating: { $ne: null } });
      const conversations = await this.conversationModel.find(queryObj);
      if (!conversations.length) throw new ErrorHandler(404, 'Conversation for employee with given query not found');
      return this.starsAndRating(conversations);
    } catch (error) {
      next(error);
    }
  }

  async getNonEyerateReviews(req: Request, next: NextFunction) {
    try {
      let skip = 0;
      if (!req.queryObj) throw new ErrorHandler(422, 'Query object not provided');
      const mentions = await this.mentionModel.find({ employee: Types.ObjectId(req.params.id) });
      const queryObj = { $and: req.queryObj.$and.filter((obj: any) => !obj.hasOwnProperty('created_at')) };
      queryObj.$and.push({ _id: { $in: mentions.map((el) => el.toObject().review) } });
      if (req.query.cursor === 'left') {
        const count = await this.reviewModel.find(queryObj).countDocuments();
        if (count < 5) {
          skip = 0;
        } else {
          skip = count - 5;
        }
      }
      const reviews = await this.reviewModel
        .find(queryObj)
        .sort({ date: req.query.sort as string })
        .select('date content rating platform author')
        .limit(5)
        .skip(skip);
      return reviews;
    } catch (error) {
      next(error);
    }
  }

  async getEyerateReviews(req: Request, next: NextFunction) {
    try {
      let skip = 0;
      const queryObj = {
        $and: req.queryObj?.$and.filter((obj: any) => !obj.hasOwnProperty('date') || obj.hasOwnProperty('keyword')),
      };
      queryObj.$and.push({ employee: Types.ObjectId(req.params.id) });
      if (req.query.cursor === 'left') {
        const count = await this.conversationModel.find(queryObj).countDocuments();
        if (count < 5) {
          skip = 0;
        } else {
          skip = count - 5;
        }
      }
      const conversations = await this.conversationModel
        .find(queryObj)
        .populate({ path: 'customer', select: 'name phone', model: CustomerModel })
        .sort({ created_at: req.query.sort as string })
        .select('created_at rating ')
        .limit(5)
        .skip(skip);
      return conversations;
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.query.platform) {
        if (req.query.platform !== 'Eyerate') {
          res.send({ data: await this.getNonEyerateReviews(req, next) });
        } else {
          res.send({ data: await this.getEyerateReviews(req, next) });
        }
      } else {
        const promiseResult = await Promise.all([
          this.getEyerateReviews(req, next),
          this.getNonEyerateReviews(req, next),
        ]);

        const res1 = promiseResult[0]?.map((e: any) => {
          const el = e.toObject();
          let rating = 0;
          !el.rating ? rating : (rating = el.rating);
          return {
            _id: el._id,
            rating: rating,
            name: el.customer.name,
            phone: el.customer.phone,
            created_at: el.created_at,
          };
        });

        const res2 = promiseResult[1]?.map((e: any, i) => {
          const el = e.toObject();
          const name = el.author;
          const created_at = el.date;
          delete el.author;
          delete el.date;
          return {
            ...el,
            name,
            created_at,
          };
        });
        if (!res1 || !res2) return;
        const sort = req.query.sort as string;
        const result = [...res1, ...res2].sort((a, b) => {
          if (!sort || sort === 'asc') {
            return a.created_at - b.created_at;
          } else {
            return b.created_at - a.created_at;
          }
        });

        let data: any = [];
        if (!req.query.cursor || req.query.cursor === 'right') {
          data = result.slice(0, 5);
        }
        if (req.query.cursor === 'left') {
          data = result.slice(-5);
        }
        res.send(data);
      }
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
    const numberOfReviews = documentArray.length;
    return { numberOfReviews, averageRating, starsData, chartData };
  }
}

export = new EmployeesController(EmployeeModel, MentionModel, ReviewModel, ConversationModel, CustomerModel);
