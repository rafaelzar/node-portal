import { NextFunction, Request, Response } from 'express';

class EmployeesController {
  async here(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

export = new EmployeesController();
