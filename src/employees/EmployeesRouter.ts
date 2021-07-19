import { NextFunction, Request, Response, Router } from "express";
import EmployeesController from "./EmployeesController";

class EmployeesRouter {
  private _router = Router();
  private _controller = EmployeesController;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  private _configure() {}
}

export = new EmployeesRouter().router;
