"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
    throw Error('Invalid NODE_ENV');
}
if (!process.env.PORT || isNaN(Number(process.env.PORT))) {
    throw Error('Invalid PORT');
}
if (!process.env.APP_DB_URI || !process.env.APP_DB_URI_DEV) {
    throw Error("Missing APP_DB_URI for this NODE_ENV (must have APP_DB_URI for 'production' and APP_DB_URI_DEV for 'development");
}
if (!process.env.SENDGRID_API_KEY) {
    throw Error('Missing SENDGRID_API_KEY');
}
if (!process.env.COGNITO_APP_USER_POOL_ID ||
    !process.env.COGNITO_APP_CLIENT_ID ||
    !process.env.COGNITO_APP_USER_POOL_REGION ||
    !process.env.COGNITO_ISS) {
    throw Error('Missing some or all Cognito env vars: COGNITO_APP_USER_POOL_ID, COGNITO_APP_CLIENT_ID, COGNITO_APP_USER_POOL_REGION, COGNITO_ISS');
}
exports.default = {
    NODE_ENV: process.env.NODE_ENV,
    APP_PORT: Number(process.env.PORT),
    // mongo
    APP_DB_URI: process.env.NODE_ENV === 'production' ? process.env.APP_DB_URI : process.env.APP_DB_URI_DEV,
    // sendgrid
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    // cognito
    COGNITO_APP_USER_POOL_ID: process.env.COGNITO_APP_USER_POOL_ID,
    COGNITO_APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID,
    COGNITO_APP_USER_POOL_REGION: process.env.COGNITO_APP_USER_POOL_REGION,
    COGNITO_ISS: process.env.COGNITO_ISS,
};
