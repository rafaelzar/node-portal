import MentionModel from '../employees/models/MentionModel';
import sgMail from './send-grid.config';
import { ChangeEvent } from 'mongodb';
import { Mention } from 'eyerate';
import ENV from '../env-config';
import EmployeeModel from '../employees/models/EmployeesModel';
import ReviewModel from '../employees/models/ReviewsModel';

export const eventTrigger = () => {
  MentionModel.watch().on('change', async (doc: ChangeEvent<any>) => {
    if (doc.operationType === 'insert') {
      const mention: Mention = doc.fullDocument;
      const employee = await EmployeeModel.findOne({ _id: mention.employee });
      const review = await ReviewModel.findOne({ _id: mention.review });
      if (!employee || !review) return;
      const employeeObj = employee.toObject();
      const reviewObj = review.toObject();
      console.log(employeeObj, 'employee');
      console.log(reviewObj, 'review');
      // await sgMail.send({
      //     to: 'dont spam clients',
      //     from: ENV.EMAIL_ADDRESS,
      //     subject: 'hi',
      //     text: `${reviewObj.content}`,
      //     html: '<h1>hello</h1>'
      // })
    }
  });
};
