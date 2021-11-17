import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import EmployeeModel from '../employees/models/EmployeesModel';
import ErrorHandler from '../errors/ErrorHandler';

export const validateEmployee: RequestHandler = async (req, _res, next) => {
  try {
    const employee = await EmployeeModel.findOne({ _id: Types.ObjectId(req.params.id) });
    if (!employee) throw new ErrorHandler(404, 'Employee not found');
    if (employee.get('cognito_id') !== req.user?.sub) throw new ErrorHandler(400, 'Cant access this route');

    const employeeObj = employee.toObject();

    req.employee = employeeObj;
    if (employeeObj?.locations) {
      req.location = Object.values(employeeObj.locations).find(
        (location) => location.active === true && location.role === 'Employee',
      );
    }
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
