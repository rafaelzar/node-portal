import { Router } from "express";
import EmployeesRouter from "./employees/EmployeesRouter";

class MainRouter {
  private _router = Router();
  private _subrouterEmployees = EmployeesRouter;

  get router() {
    return this._router;
  }

  constructor() {
    this._configure();
  }

  /**
   * Connect routes to their matching routers
   */
  private _configure() {
    this._router.use("/employees", this._subrouterEmployees);
  }
}

export = new MainRouter().router;
