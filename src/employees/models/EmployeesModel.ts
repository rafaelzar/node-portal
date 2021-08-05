import { Types, Schema, model } from "mongoose";
import { Employee } from "eyerate";
export const EmployeeSchema: Schema = new Schema({}, { collection: "employees" });

const EmployeeModel = model<Employee>("Users", EmployeeSchema);
export default EmployeeModel;
