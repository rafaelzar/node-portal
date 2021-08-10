import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import jwkToPem from 'jwk-to-pem';
import ICognitoUser from '../ICognitoUser';
import ErrorHandler from '../errors/ErrorHandler';

export const validateJWT: RequestHandler = async (req, _res, next) => {
  const idToken = String(req.headers['authorization']);

  try {
    const token = idToken.split(' ').pop();
    // Not a valid Bearer token
    if (!token) throw new ErrorHandler(403, 'Unauthorized, Invalid JWT');
    const decodedJwt = jwt.decode(token);

    if (!decodedJwt || typeof decodedJwt === 'string')
      // Not a valid JWT Token
      throw new ErrorHandler(403, 'Unauthorized, Invalid JWT');

    if (decodedJwt.iss !== process.env.COGNITO_ISS) {
      // invalid issuer
      throw new ErrorHandler(403, 'Unauthorized, Invalid issuer');
    }

    if (decodedJwt.token_use !== 'id') {
      // Reject the jwt if it's not an id token
      throw new ErrorHandler(403, 'Unauthorized, Invalid id');
    }

    if (decodedJwt.aud !== process.env.COGNITO_WEBAPP_CLIENT_ID) {
      // token audience (client_id) is invalid
      throw new ErrorHandler(403, 'invalid aud/client_id');
    }

    const decoded = await axios.get(`${decodedJwt.iss}/.well-known/jwks.json`);
    const pubKeys = decoded.data;
    const pem = jwkToPem(pubKeys.keys[0]);
    if (!pem) {
      // Invalid kid
      throw new ErrorHandler(403, 'Unauthorized, null or missing pem');
    }

    // throws error if expired, invalid, or verification failure
    const verified = jwt.verify(idToken, pem, {
      issuer: decodedJwt.iss,
    }) as string | any;

    if (typeof verified === 'string') {
      throw new ErrorHandler(403, 'Unauthorized, JWT result is a string');
    }

    const cognito_user = verified as ICognitoUser;

    if (!cognito_user.sub) {
      throw new ErrorHandler(403, 'Unauthorized, Missing sub in verified user');
    }

    req.user = cognito_user;
    next();
  } catch (error) {
    next(error);
  }
};
