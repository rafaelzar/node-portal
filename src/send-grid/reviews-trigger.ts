import cron from 'node-cron';
import bluebird from 'bluebird';
import sgMail from './send-grid.config';
import { MailDataRequired } from '@sendgrid/mail';
import { Types } from 'mongoose';
import dayjs from 'dayjs';
import ENV from '../env-config';
import ReviewModel from '../employees/models/ReviewsModel';
import MentionModel from '../employees/models/MentionModel';
import LocationModel from '../employees/models/LocationModel';
import EmployeeModel from '../employees/models/EmployeesModel';

export const reviewsTrigger = () => {
  cron.schedule('0 0 * * *', async () => {
    const createdAfter = dayjs().subtract(1, 'day').toDate();

    try {
      const [{ metionsForLast24Hours }] = await MentionModel.aggregate()
        .match({
          date: {
            $gte: createdAfter,
          },
          review: {
            $ne: null,
          },
        })
        .facet({
          metionsForLast24Hours: [
            {
              $group: {
                _id: '$employee',
                mentions: { $sum: 1 },
                reviews: {
                  $push: {
                    _id: '$review',
                    locationId: '$location',
                  },
                },
              },
            },
          ],
        });

      bluebird.map(
        metionsForLast24Hours,
        async ({
          _id,
          reviews,
        }: {
          _id: Types.ObjectId;
          reviews: { _id: Types.ObjectId; locationId: Types.ObjectId }[];
        }) => {
          const employee = await EmployeeModel.findById(_id);
          const reviewsForPaidLocations = await bluebird
            .map(reviews, async (review) => ({
              ...review,
              location: await LocationModel.findById(review.locationId),
            }))
            .filter(({ location }) => Boolean(location?.features?.employeeApp) === false);

          if (employee && employee.email && reviewsForPaidLocations.length) {
            const reviewsIds = reviewsForPaidLocations.map(({ _id }) => _id);
            const reviews = await ReviewModel.find({
              _id: { $in: reviewsIds },
            });

            const dynamicTemplateData = {
              employee_name: employee.first_name,
              employee_link: ENV.FE_LINK,
              reviews: reviews.map((review) => ({
                rating: review.get('rating'),
                message: review.get('content'),
              })),
            };

            const msg: MailDataRequired = {
              to: employee.email,
              from: ENV.EMAIL_ADDRESS,
              templateId: ENV.EMPLOYEE_TEMPLATE_ID,
              dynamicTemplateData,
            };

            if (process.env.NODE_ENV === 'production') {
              await sgMail.send(msg);
            } else {
              console.log(msg);
            }
          }
        },
        {
          concurrency: 1,
        },
      );
    } catch (error) {
      console.error(error);
    }
  });
};
