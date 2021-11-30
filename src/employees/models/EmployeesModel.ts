import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Employee } from 'eyerate';

export const EmployeeSchema: Schema = new Schema(
  {
    email: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
    },
    photo_url: {
      type: String,
    },
    first_name: {
      type: String,
      require: true,
    },
    last_name: {
      type: String,
      require: true,
    },
    nick_names: {
      type: [String],
    },
    active: {
      type: Boolean,
    },
    cognito_id: {
      type: String,
    },
    plaid_account: {
      type: ObjectId,
    },
    last_seen: {
      type: new Schema({
        reviews: {
          type: Date,
        },
        payments: {
          type: Date,
        },
      }),
    },
  },
  { collection: 'Employees', timestamps: true },
);

const EmployeeModel = model<Employee>('Employees', EmployeeSchema);
export default EmployeeModel;
