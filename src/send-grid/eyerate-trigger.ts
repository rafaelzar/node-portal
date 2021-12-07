import { Conversation } from 'eyerate';
import ConversationModel from '../employees/models/ConversationModels';
import EmployeeModel from '../employees/models/EmployeesModel';
import sgMail from './send-grid.config';
import { ChangeEvent } from 'mongodb';
import ENV from '../env-config';
import LocationModel from '../employees/models/LocationModel';
import cityTimezones from 'city-timezones';
import moment from 'moment-timezone';
export const eyerateTrigger = () => {
  ConversationModel.watch().on('change', async (doc: ChangeEvent<any>) => {
    if (doc.operationType === 'insert') {
      try {
        const conversation: Conversation = doc.fullDocument;
        if (!conversation.employee) return;
        const employee = await EmployeeModel.findOne({ _id: conversation.employee });
        const location = await LocationModel.findOne({ _id: conversation.location });
        const city = location?.toObject().address.city;
        const employeeObj = employee?.toObject();
        if (!employeeObj?.email || !conversation.rating) return;
        let date: string;
        if (city) {
          const timezone = cityTimezones.lookupViaCity(city)[0]?.timezone || 'America/Los_Angeles';

          const mom = moment.tz(new Date(String(conversation.created_at)), timezone);
          date = mom.format('LLL');
        } else {
          const mom = moment.tz(new Date(String(conversation.created_at)), 'America/Los_Angeles');
          date = mom.format('LLL');
        }

        const templateData = {
          date,
          rating: conversation.rating,
          employee_name: employeeObj.first_name,
          employee_link: ENV.FE_LINK,
        };

        const msg: any = {
          to: employeeObj.email,
          from: ENV.EMAIL_ADDRESS,
          template_id: ENV.EMPLOYEE_TEMPLATE_ID,
          dynamic_template_data: templateData,
        };

        if (process.env.NODE_ENV === 'production') {
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
