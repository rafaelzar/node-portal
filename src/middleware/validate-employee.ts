import { RequestHandler } from 'express';
import EmployeeModel from '../employees/models/EmployeesModel';
import ErrorHandler from '../errors/ErrorHandler';

export const validateEmployee: RequestHandler = async (req, _res, next) => {
  try {
    const user = req.user || {};
    const employee = await EmployeeModel.findOne({ _id: req.params.id });
    if (!employee) throw new ErrorHandler(404, 'Employee not found');
    if (employee.cognito_id !== user.aud) throw new ErrorHandler(400, 'Cant access this route');
    next();
    next();
  } catch (error) {
    next(error);
  }
};
