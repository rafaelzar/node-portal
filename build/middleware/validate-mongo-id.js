"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMongoId = void 0;
const mongoose_1 = require("mongoose");
const ErrorHandler_1 = __importDefault(require("../errors/ErrorHandler"));
const validateMongoId = (req, res, next) => {
    try {
        if (mongoose_1.isValidObjectId(req.params.id))
            next();
        else {
            new ErrorHandler_1.default(400, 'Not valid mongo id');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.validateMongoId = validateMongoId;
