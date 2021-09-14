import MentionModel from '../employees/models/MentionModel';
import sgMail from './send-grid.config';
import { ChangeEvent } from 'mongodb';
import { Mention } from 'eyerate';
import ENV from '../env-config';
import EmployeeModel from '../employees/models/EmployeesModel';
import ReviewModel from '../employees/models/ReviewsModel';

export const nonEyerateTrigger = () => {
  MentionModel.watch().on('change', async (doc: ChangeEvent<any>) => {
    if (doc.operationType === 'insert') {
      try {
        const mention: Mention = doc.fullDocument;
        const employee = await EmployeeModel.findOne({ _id: mention.employee });
        const review = await ReviewModel.findOne({ _id: mention.review });
        if (!employee || !review) return;
        const employeeObj = employee.toObject();
        const reviewObj = review.toObject();
        const templateData = {
          review_text: reviewObj.content,
          review_rating: reviewObj.rating,
          review_date: String(review.date),
          employee_link: ENV.FE_LINK,
        };
        const msg: any = {
          // dont spam users
          // to: employeeObj.email,
          to: 'k7.education.acc@gmail.com',
          from: ENV.EMAIL_ADDRESS,
          template_id: ENV.EMPLOYEE_TEMPLATE_ID,
          dynamic_template_data: templateData,
        };
        await sgMail.send(msg);
      } catch (error) {
        console.log(error);
      }
    }
  });
};
