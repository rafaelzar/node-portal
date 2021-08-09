import { Router } from 'express';
import EmployeesController from './EmployeesController';

class EmployeesRouter {
  private _router = Router();
  private _controller = EmployeesController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {
    this._router.get('/here', this._controller.here);
  }
}

export = new EmployeesRouter().router;
