import { Schema, model } from 'mongoose';
import { Employee } from 'eyerate';

export const EmployeeSchema: Schema = new Schema({}, { collection: 'Employees', timestamps: true });

const EmployeeModel = model<Employee>('Employees', EmployeeSchema);
export default EmployeeModel;
