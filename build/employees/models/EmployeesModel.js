"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeSchema = void 0;
const mongoose_1 = require("mongoose");
exports.EmployeeSchema = new mongoose_1.Schema({
    location: {
        type: mongoose_1.Types.ObjectId,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
    },
    first_name: {
        type: String,
        require: true,
    },
    last_name: {
        type: String,
        require: true,
    },
    nick_names: {
        type: [mongoose_1.Types.ObjectId],
    },
    active: {
        type: Boolean,
    },
}, { collection: 'employees', timestamps: true });
const EmployeeModel = mongoose_1.model('Users', exports.EmployeeSchema);
exports.default = EmployeeModel;
