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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const jwk_to_pem_1 = __importDefault(require("jwk-to-pem"));
const ErrorHandler_1 = __importDefault(require("../errors/ErrorHandler"));
const validateJWT = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idToken = String(req.headers["authorization"]);
    try {
        const token = idToken.split(' ').pop();
        // Not a valid Bearer token
        if (!token)
            throw new ErrorHandler_1.default(403, 'Unauthorized, Invalid JWT');
        const decodedJwt = jsonwebtoken_1.default.decode(token);
        if (!decodedJwt || typeof decodedJwt === "string")
            // Not a valid JWT Token
            throw new ErrorHandler_1.default(403, "Unauthorized, Invalid JWT");
        if (decodedJwt.iss !== process.env.COGNITO_ISS) {
            // invalid issuer
            throw new ErrorHandler_1.default(403, "Unauthorized, Invalid issuer");
        }
        if (decodedJwt.token_use !== "id") {
            // Reject the jwt if it's not an id token
            throw new ErrorHandler_1.default(403, "Unauthorized, Invalid id");
        }
        if (decodedJwt.aud !== process.env.COGNITO_WEBAPP_CLIENT_ID) {
            // token audience (client_id) is invalid
            throw new ErrorHandler_1.default(403, "invalid aud/client_id");
        }
        const decoded = yield axios_1.default.get(`${decodedJwt.iss}/.well-known/jwks.json`);
        const pubKeys = decoded.data;
        const pem = jwk_to_pem_1.default(pubKeys.keys[0]);
        if (!pem) {
            // Invalid kid
            throw new ErrorHandler_1.default(403, "Unauthorized, null or missing pem");
        }
        // throws error if expired, invalid, or verification failure
        const verified = jsonwebtoken_1.default.verify(idToken, pem, {
            issuer: decodedJwt.iss,
        });
        if (typeof verified === "string") {
            throw new ErrorHandler_1.default(403, "Unauthorized, JWT result is a string");
        }
        const cognito_user = verified;
        if (!cognito_user.sub) {
            throw new ErrorHandler_1.default(403, "Unauthorized, Missing sub in verified user");
        }
        req.user = cognito_user;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateJWT = validateJWT;
