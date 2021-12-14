import MentionModel from '../employees/models/MentionModel';
import sgMail from './send-grid.config';
import { ChangeEvent } from 'mongodb';
import { Mention } from 'eyerate';
import ENV from '../env-config';
import EmployeeModel from '../employees/models/EmployeesModel';
import ReviewModel from '../employees/models/ReviewsModel';
import cityTimezones from 'city-timezones';
import LocationModel from '../employees/models/LocationModel';

import moment from 'moment-timezone';
export const nonEyerateTrigger = () => {
  MentionModel.watch().on('change', async (doc: ChangeEvent<any>) => {
    if (doc.operationType === 'insert') {
      try {
        const mention: Mention = doc.fullDocument;

        const location = await LocationModel.findOne({ _id: mention.location });
        const city = location?.toObject().address.city;

        const employee = await EmployeeModel.findOne({ _id: mention.employee });
        const review = await ReviewModel.findOne({ _id: mention.review });
        const employeeObj = employee?.toObject();
        const reviewObj = review?.toObject();
        if (!employeeObj?.email || !reviewObj) return;
        let date = '';
        if (city) {
          const timezone = cityTimezones.lookupViaCity(city)[0]?.timezone || 'America/Los_Angeles';

          const mom = moment.tz(new Date(reviewObj.date), timezone);
          date = mom.format('LLL');
        } else {
          const mom = moment.tz(new Date(reviewObj.date), 'America/Los_Angeles');
          date = mom.format('LLL');
        }

        const templateData = {
          date,
          message: reviewObj.content,
          rating: reviewObj.rating,
          employee_name: employeeObj.first_name,
          employee_link: ENV.FE_LINK,
        };

        const msg: any = {
          to: employeeObj.email,
          from: ENV.EMAIL_ADDRESS,
          template_id: ENV.EMPLOYEE_TEMPLATE_ID,
          dynamic_template_data: templateData,
        };

        if (ENV.IS_PRODUCTION) {
          // await sgMail.send(msg);
        } else {
          console.log(msg);
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
};
