import { Types, Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Employee } from 'eyerate';

export const EmployeeSchema: Schema = new Schema(
  {
    location: {
      type: Types.ObjectId,
      require: true,
    },
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
  },
  { collection: 'Employees', timestamps: true },
);

const EmployeeModel = model<Employee>('Employees', EmployeeSchema);
export default EmployeeModel;
