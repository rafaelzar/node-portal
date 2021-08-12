import { Router } from 'express';
import { updateEmployeeDto } from '../middleware/dto/update-employee.dto';
import { validateJWT } from '../middleware/validate-jwt';
import EmployeesController from './EmployeesController';
import { validateMongoId } from '../middleware/validate-mongo-id';
class EmployeesRouter {
  private _router = Router();
  private _controller = EmployeesController;

  private validateJwt = this._controller.validateJwt.bind(this._controller);
  private updateEmployee = this._controller.updateEmployee.bind(this._controller);

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {
    this._router.get('/validate-jwt', validateJWT, this.validateJwt);
    this._router.patch('/:id', validateMongoId, updateEmployeeDto, validateJWT, this.updateEmployee);
  }
}

export = new EmployeesRouter().router;
