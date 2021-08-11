import { NextFunction, Request, Response } from 'express';
import { Employee } from 'eyerate';
import EmployeeModel from './models/EmployeesModel';
import { Model } from 'mongoose';
import ErrorHandler from '../errors/ErrorHandler';

class EmployeesController {
  constructor(private employeeModel: Model<Employee>) {}

  async validateJwt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ErrorHandler(404, 'Cognito user not found');
      const user = await this.employeeModel.findOne({ email: req.user.email });
      if (!user) throw new ErrorHandler(404, 'User not found');
    } catch (error) {
      next(error);
    }
  }
}

export = new EmployeesController(EmployeeModel);
