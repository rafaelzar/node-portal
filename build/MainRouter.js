"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const EmployeesRouter_1 = __importDefault(require("./employees/EmployeesRouter"));
class MainRouter {
    constructor() {
        this._router = express_1.Router();
        this._subrouterEmployees = EmployeesRouter_1.default;
        this._configure();
    }
    get router() {
        return this._router;
    }
    /**
     * Connect routes to their matching routers
     */
    _configure() {
        this._router.use("/employees", this._subrouterEmployees);
    }
}
module.exports = new MainRouter().router;
