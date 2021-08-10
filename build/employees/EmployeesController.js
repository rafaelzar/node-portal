"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const EmployeesModel_1 = __importDefault(require("./models/EmployeesModel"));
const ErrorHandler_1 = __importDefault(require("../errors/ErrorHandler"));
class EmployeesController {
    constructor(employeeModel) {
        this.employeeModel = employeeModel;
    }
    validateJwt(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user)
                    throw new ErrorHandler_1.default(404, 'User not found by middleware');
                res.status(202).send(req.user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    findByEmail(email, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.employeeModel.findOne({ email });
                if (!user)
                    throw new ErrorHandler_1.default(404, 'User not found');
                return user;
            }
            catch (error) {
                next(error);
            }
        });
    }
}
module.exports = new EmployeesController(EmployeesModel_1.default);
