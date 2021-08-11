import { Router } from 'express';
import { validateJWT } from '../middleware/validate-jwt';
import EmployeesController from './EmployeesController';

class EmployeesRouter {
  private _router = Router();
  private _controller = EmployeesController;

  private validateJwt = this._controller.validateJwt.bind(this._controller);

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {
    this._router.get('/validate-jwt', validateJWT, this.validateJwt);
  }
}

export = new EmployeesRouter().router;
