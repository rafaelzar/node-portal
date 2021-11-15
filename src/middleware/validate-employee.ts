import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import EmployeeModel from '../employees/models/EmployeesModel';
import ErrorHandler from '../errors/ErrorHandler';

export const validateEmployee: RequestHandler = async (req, _res, next) => {
  try {
    const user = req.user || {};
    const employee = await EmployeeModel.findOne({ _id: Types.ObjectId(req.params.id) });
    if (!employee) throw new ErrorHandler(404, 'Employee not found');
    if (employee.get('cognito_id') !== user.sub) throw new ErrorHandler(400, 'Cant access this route');

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
