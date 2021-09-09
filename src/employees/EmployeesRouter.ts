import { Router, Request, Response, NextFunction, response } from 'express';
import { updateEmployeeDto } from '../middleware/dto/update-employee.dto';
import { validateJWT } from '../middleware/validate-jwt';
import EmployeesController from './EmployeesController';
import { validateMongoId } from '../middleware/validate-mongo-id';
import autoBind from 'auto-bind';
import { validateQueryParam } from '../middleware/validate-query-param';
import { tokenExchangeDto } from '../middleware/dto/token-exchange.dto';
import { validateDate } from '../middleware/validate-date';

class EmployeesRouter {
  private _router = Router();
  private _controller = EmployeesController;

  get router() {
    return this._router;
  }

  constructor() {
    autoBind(this._controller);
    this._configure();
  }

  private _configure() {
    this._router.get('/validate-jwt', validateJWT, this._controller.getEmployee);
    this._router.patch('/:id', validateMongoId, validateJWT, updateEmployeeDto, this._controller.updateEmployee);
    this._router.get('/reviews/:id', validateMongoId, validateJWT, validateQueryParam, this._controller.getReviews);
    this._router.get('/stats/:id', validateMongoId, validateJWT, validateQueryParam, this._controller.userStats);
    this._router.get('/create-link-token/:id', validateMongoId, validateJWT, this._controller.createLinkToken);
    this._router.post(
      '/token-exchange/:id',
      validateMongoId,
      validateJWT,
      tokenExchangeDto,
      this._controller.exchangeToken,
    );
    this._router.get('/bank-accounts/:id', validateMongoId, validateJWT, this._controller.getBankAccounts);
    this._router.get('/revenue/:id', validateMongoId, validateJWT, validateDate, this._controller.getRevenue);
    this._router.get('/earnings/:id', validateMongoId, validateJWT, this._controller.getBalanceAndLastPayment);
    this._router.delete('/plaid-account/:id', validateMongoId, validateJWT, this._controller.removePlaidAccount);
  }
}

export = new EmployeesRouter().router;
