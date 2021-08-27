import { NextFunction, Request, Response } from 'express';
import { Employee, Review, Mention, Conversation, Customer } from 'eyerate';
import EmployeeModel from './models/EmployeesModel';
import { Model, Types } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';

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

  async getNonEyerateStats(req: Request, next: NextFunction) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      endDate.setHours(endDate.getHours() + 24);
      const queryObj = {
        $and: req.queryObj?.$and.filter((obj: any) => obj.hasOwnProperty('platform')),
      };
      queryObj.$and.push({
        date: {
          $gt: startDate,
          $lt: endDate,
        },
      });
      const mentions = await this.mentionModel.find({
        employee: Types.ObjectId(req.params.id),
      });
      if (!mentions.length) throw new ErrorHandler(404, 'Mentions for employee not found');
      queryObj.$and.push({ _id: { $in: mentions.map((mention) => mention.toObject().review) } });
      return await this.reviewModel.find(queryObj);
    } catch (error) {
      next(error);
    }
  }

  async getEyerateStats(req: Request, next: NextFunction) {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      endDate.setHours(endDate.getHours() + 24);
      const queryObj = { $and: [] as any };
      queryObj.$and.push({ employee: Types.ObjectId(req.params.id) }, { rating: { $ne: null } });
      queryObj.$and.push({
        created_at: {
          $gt: startDate,
          $lt: endDate,
        },
      });
      return await this.conversationModel.find(queryObj);
    } catch (error) {
      next(error);
    }
  }

  async getNonEyerateReviews(req: Request, next: NextFunction) {
    try {
      let skip = 0;
      let isLast;
      let isFirst;
      if (!req.queryObj) throw new ErrorHandler(422, 'Query object not provided');
      const mentions = await this.mentionModel.find({ employee: Types.ObjectId(req.params.id) });
      const queryObj = { $and: req.queryObj.$and.filter((obj: any) => !obj.hasOwnProperty('created_at')) };
      queryObj.$and.push({ _id: { $in: mentions.map((el) => el.toObject().review) } });
      const countNonEyerate = await this.reviewModel.find(queryObj).countDocuments();
      if (req.query.cursor === 'left') {
        if (countNonEyerate < 5) {
          skip = 0;
        } else {
          skip = countNonEyerate - 5;
        }
        const limiter = this.paginationLimiterLeft(countNonEyerate, req.query.firstDate);
        isLast = limiter?.isLast;
        isFirst = limiter?.isFirst;
      }
      if (!req.query.cursor || req.query.cursor === 'right') {
        const limiter = this.paginationLimiterRight(countNonEyerate, req.query.lastDate);
        isLast = limiter?.isLast;
        isFirst = limiter?.isFirst;
      }
      const reviews = await this.reviewModel
        .find(queryObj)
        .sort({ date: req.query.sort as string })
        .select('date content rating platform author')
        .limit(5)
        .skip(skip);
      let results = [];
      if (reviews.length !== 0) {
        results = reviews.map((e: any) => {
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
      }

      return { results, countNonEyerate, isLast, isFirst };
    } catch (error) {
      next(error);
    }
  }

  async getEyerateReviews(req: Request, next: NextFunction) {
    try {
      let skip = 0;
      let isLast;
      let isFirst;
      const queryObj = {
        $and: req.queryObj?.$and.filter((obj: any) => !obj.hasOwnProperty('date') || obj.hasOwnProperty('keyword')),
      };
      queryObj.$and.push({ employee: Types.ObjectId(req.params.id) }, { rating: { $ne: null } });

      const countEyerate = await this.conversationModel.find(queryObj).countDocuments();
      if (req.query.cursor === 'left') {
        if (countEyerate < 5) {
          skip = 0;
        } else {
          skip = countEyerate - 5;
        }
        const limiter = this.paginationLimiterLeft(countEyerate, req.query.firstDate);
        isLast = limiter?.isLast;
        isFirst = limiter?.isFirst;
      }
      if (!req.query.cursor || req.query.cursor === 'right') {
        const limiter = this.paginationLimiterRight(countEyerate, req.query.lastDate);
        isLast = limiter?.isLast;
        isFirst = limiter?.isFirst;
      }

      const conversations = await this.conversationModel
        .find(queryObj)
        .populate({ path: 'customer', select: 'name phone', model: CustomerModel })
        .sort({ created_at: req.query.sort as string })
        .select('created_at rating ')
        .limit(5)
        .skip(skip);

      let results: any = [];
      if (conversations.length !== 0)
        results = conversations.map((el: any) => {
          const obj = el.toObject();
          return {
            _id: obj._id,
            rating: obj.rating,
            name: obj.customer.name,
            phone: obj.customer.phone,
            created_at: obj.created_at,
          };
        });
      return { results, countEyerate, isLast, isFirst };
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.query.platform) {
        if (req.query.platform !== 'Eyerate') {
          const promiseResult = await Promise.all([
            this.getNonEyerateReviews(req, next),
            this.getNonEyerateStats(req, next),
          ]);
          res.send({
            data: promiseResult[0]?.results,
            stats: this.averageStats(promiseResult[1] as []),
            isLast: promiseResult[0]?.isLast,
            isFirst: promiseResult[0]?.isFirst,
          });
        } else {
          const promiseResult = await Promise.all([this.getEyerateReviews(req, next), this.getEyerateStats(req, next)]);
          res.send({
            data: promiseResult[0]?.results,
            stats: this.averageStats(promiseResult[1] as []),
            isLast: promiseResult[0]?.isLast,
            isFirst: promiseResult[0]?.isFirst,
          });
        }
      } else {
        const promiseResult = await Promise.all([
          this.getEyerateReviews(req, next),
          this.getNonEyerateReviews(req, next),
          this.getEyerateStats(req, next),
          this.getNonEyerateStats(req, next),
        ]);

        const res1 = promiseResult[0]?.results;
        const res2 = promiseResult[1]?.results;

        if (!res1 || !res2) return;
        const sort = req.query.sort as string;
        const result = [...res1, ...res2].sort((a, b) => {
          if (!sort || sort === 'asc') {
            return a.created_at - b.created_at;
          } else {
            return b.created_at - a.created_at;
          }
        });

        const countEyerate = promiseResult[0]?.countEyerate as number;
        const countNonEyerate = promiseResult[1]?.countNonEyerate as number;
        let data: any = [];
        let isLast;
        let isFirst;
        if (!req.query.cursor || req.query.cursor === 'right') {
          data = result.slice(0, 5);
          const limiter = this.paginationLimiterRight(countEyerate + countNonEyerate, req.query.lastDate);
          isLast = limiter?.isLast;
          isFirst = limiter?.isFirst;
        }
        if (req.query.cursor === 'left') {
          data = result.slice(-5);
          const limiter = this.paginationLimiterLeft(countEyerate + countNonEyerate, req.query.firstDate);
          isLast = limiter?.isLast;
          isFirst = limiter?.isFirst;
        }

        const eyerate = promiseResult[2] as [];
        const noneyerate = promiseResult[3] as [];
        const stats = this.averageStats([...eyerate, ...noneyerate]);
        res.send({ data, stats, isLast, isFirst });
      }
    } catch (error) {
      next(error);
    }
  }
  private async reviewStatsAndMentions(employeeId: string, next: NextFunction) {
    try {
      const mentions = await this.mentionModel.find({ employee: Types.ObjectId(employeeId) });
      let reviewIds: any[] = [];
      if (mentions.length !== 0) {
        reviewIds = mentions.map((el) => el.toObject().review);
      }
      console.log(reviewIds.map((el) => el.review));
      const reviews = await this.reviewModel.aggregate().facet({
        reviewSiteMentions: [
          {
            $match: { _id: { $in: reviewIds } },
          },
          {
            $group: {
              _id: { platform: '$platform' },
              numOfReviews: { $sum: 1 },
              platform: { $first: '$platform' },
            },
          },
          {
            $project: { _id: 0, platform: 1, numOfReviews: 1 },
          },
        ],
        reviewStatsAllTime: [
          {
            $match: { _id: { $in: reviewIds } },
          },
          {
            $group: {
              _id: null,
              mentions: { $sum: 1 },

              sumRating: { $sum: '$rating' },
            },
          },
          { $project: { _id: 0, mentions: 1, sumRating: 1 } },
        ],
        reviewStatsThisMonth: [
          {
            $project: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
          },
          {
            $match: { _id: { $in: reviewIds }, year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
          },

          {
            $group: {
              _id: null,
              mentions: { $sum: 1 },
            },
          },
          { $project: { _id: 0, mentions: 1 } },
        ],
      });
      // .project({
      //   reviewSiteMentions: 1,
      //   reviewStatsThisMonth: {
      //     $arrayElemAt: ['$reviewStatsThisMonth', 0],
      //   },
      //   reviewStatsAllTime: {
      //     $arrayElemAt: ['$reviewStatsAllTime', 0],
      //   },
      // });

      // const conversationsAllTime = await this.conversationModel
      //   .find({ employee: Types.ObjectId(employeeId) })
      //   .countDocuments();

      const conversations = await this.conversationModel.aggregate().facet({
        convThisMonth: [
          {
            $project: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
              employee: 1,
              rating: 1,
            },
          },
          {
            $match: {
              employee: Types.ObjectId(employeeId),
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              rating: { $ne: null },
            },
          },
          { $count: 'mentions' },
        ],
        convAllTime: [
          {
            $match: {
              employee: Types.ObjectId(employeeId),
              rating: { $ne: null },
            },
          },
          {
            $group: {
              _id: null,
              mentions: { $sum: 1 },
              sumRating: { $sum: '$rating' },
            },
          },
          {
            $project: {
              _id: 0,
              mentions: 1,
              sumRating: 1,
            },
          },
        ],
      });

      const conv = conversations[0];
      const rev = reviews[0];
      let mentMonth = 0;
      let mentAllTime = 0;
      let sumRating = 0;
      let mentAllTimeEyerate = 0;
      if (conv.convThisMonth[0]?.mentions) {
        mentMonth += conv.convThisMonth[0].mentions;
      }
      if (rev.reviewStatsThisMonth[0]?.mentions) {
        mentMonth += rev.reviewStatsThisMonth[0].mentions;
      }
      if (conv.convAllTime[0]?.mentions) {
        mentAllTime += conv.convAllTime[0].mentions;
        mentAllTimeEyerate = conv.convAllTime[0].mentions;
      }
      if (rev.reviewStatsAllTime[0]?.mentions) {
        mentAllTime += rev.reviewStatsAllTime[0].mentions;
      }
      if (conv.convAllTime[0]?.sumRating) {
        sumRating += conv.convAllTime[0].sumRating;
      }
      if (rev.reviewStatsAllTime[0]?.sumRating) {
        sumRating += rev.reviewStatsAllTime[0].sumRating;
      }
      const avgAllTime = sumRating / mentAllTime;

      rev.reviewSiteMentions.push({ numOfReviews: mentAllTimeEyerate, platform: 'Eyerate' });

      return {
        reviewStats: {
          mentionsThisMonth: mentMonth,
          mentionsAllTime: mentAllTime,
          averageRatingAllTime: avgAllTime,
        },
        reviewSiteMentions: rev.reviewSiteMentions,
      };
    } catch (error) {
      next(error);
    }
  }
  async userStats(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.params.id;

      // ------------- potential stats for payments ------------

      // const leaderBoardArr = await this.paymentModel
      //   .aggregate()
      //   .match({ employee: Types.ObjectId(employeeId) })
      //   .group({ _id: { employeeId: '$employee' }, allTimeEarnings: { $sum: '$amount' } })

      //   .sort({ allTimeEarnings: -1 })
      //   .project({ count: { $sum: 1 } });
      // console.log(leaderBoardArr);
      // const allTimeEarningsArr = await this.paymentModel
      //   .aggregate()
      //   .match({ employee: Types.ObjectId(employeeId) })
      //   .group({ _id: { employeeId: '$employee' }, allTimeEarnings: { $sum: '$amount' } })
      //   .project({ _id: 0 });

      // const thisMonthEarningsArr = await this.paymentModel
      //   .aggregate()
      //   .match({
      //     employee: Types.ObjectId(employeeId),
      //     'payment_period.year': new Date().getFullYear(),
      //     'payment_period.month': new Date().getMonth() + 1,
      //   })
      //   .group({ _id: { employeeId: '$employee' }, thisMonthEarnings: { $sum: '$amount' } })
      //   .project({ _id: 0 });
      // res.send({ earningStats: { ...allTimeEarningsArr[0], ...thisMonthEarningsArr[0] } });

      //----------
      const resp = await this.reviewStatsAndMentions(employeeId, next);
      res.send(resp);
    } catch (error) {
      next(error);
    }
  }

  // helper methods

  averageStats(documentArray: any[]) {
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
    let Eyerate = 0;

    for (const documentObj of documentArray) {
      if (documentObj.toObject().hasOwnProperty('platform')) {
        if (documentObj.toObject().platform === 'Weedmaps') Weedmaps++;
        if (documentObj.toObject().platform === 'Yelp') Yelp++;
        if (documentObj.toObject().platform === 'Google') Google++;
        if (documentObj.toObject().platfrom === 'GMB') GMB++;
      } else {
        Eyerate++;
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
    const chartData = [Weedmaps, Yelp, Google, GMB, Eyerate];
    const averageRating = sumReview / documentArray.length;
    const numberOfReviews = documentArray.length;
    return { numberOfReviews, averageRating, starsData, chartData };
  }

  paginationLimiterRight(count: number, date: any) {
    if (count > 5 && !date) return { isLast: false, isFirst: true };
    if (count > 5 && date) return { isLast: false, isFirst: false };
    if (count < 6 && !date) return { isLast: true, isFirst: true };
    if (count < 6 && date) return { isLast: true, isFirst: false };
  }

  paginationLimiterLeft(count: number, date: any) {
    if (count > 5 && !date) return { isLast: false, isFirst: true };
    if (count > 5 && date) return { isLast: false, isFirst: false };
    if (count < 6 && !date) return { isLast: true, isFirst: true };
    if (count < 6 && date) return { isLast: false, isFirst: true };
  }
}

export = new EmployeesController(EmployeeModel, MentionModel, ReviewModel, ConversationModel);
