"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
const validate_jwt_1 = require("../middleware/validate-jwt");
const EmployeesController_1 = __importDefault(require("./EmployeesController"));
class EmployeesRouter {
    constructor() {
        this._router = express_1.Router();
        this._controller = EmployeesController_1.default;
        this._configure();
    }
    get router() {
        return this._router;
    }
    _configure() {
        this._router.get('/validate-jwt', validate_jwt_1.validateJWT, this._controller.validateJwt);
    }
}
module.exports = new EmployeesRouter().router;
