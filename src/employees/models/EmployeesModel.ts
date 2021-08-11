import { Types, Schema, model } from 'mongoose';
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
    first_name: {
      type: String,
      require: true,
    },
    last_name: {
      type: String,
      require: true,
    },
    nick_names: {
      type: [Types.ObjectId],
    },
    active: {
      type: Boolean,
    },
  },
  { collection: 'Employees', timestamps: true },
);

const EmployeeModel = model<Employee>('Employees', EmployeeSchema);
export default EmployeeModel;
