import { Conversation } from 'eyerate';
import ConversationModel from '../employees/models/ConversationModels';
import EmployeeModel from '../employees/models/EmployeesModel';
import sgMail from './send-grid.config';
import { ChangeEvent } from 'mongodb';
import ENV from '../env-config';

export const eyerateTrigger = () => {
  ConversationModel.watch().on('change', async (doc: ChangeEvent<any>) => {
    if (doc.operationType === 'insert') {
      try {
        const conversation: Conversation = doc.fullDocument;
        if (!conversation.employee) return;
        const employee = await EmployeeModel.findOne({ _id: conversation.employee });
        if (!employee || !employee.email || !conversation.rating) return;
        const employeeObj = employee.toObject();
        const templateData = {
          review_text: 'dummy review text',
          review_rating: conversation.rating,
          review_date: conversation.created_at,
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
