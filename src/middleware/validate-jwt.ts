import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import jwkToPem from "jwk-to-pem";
import ICognitoUser from "../ICognitoUser";

export const validateJWT: RequestHandler = async (req, res, next) => {
  const idToken = String(req.headers["authorization"]);

  try {
    const decodedJwt = jwt.decode(idToken);

    if (!decodedJwt || typeof decodedJwt === "string")
      // Not a valid JWT Token
      throw new Error("invalid JWT");

    if (decodedJwt.iss !== process.env.COGNITO_ISS) {
      // invalid issuer
      throw new Error("invalid issuer");
    }

    if (decodedJwt.token_use !== "id") {
      // Reject the jwt if it's not an id token
      throw new Error("Invalid id");
    }

    if (decodedJwt.aud !== process.env.COGNITO_WEBAPP_CLIENT_ID) {
      // token audience (client_id) is invalid
      throw new Error("invalid aud/client_id");
    }

    const decoded = await axios.get(`${decodedJwt.iss}/.well-known/jwks.json`);
    const pubKeys = decoded.data;
    const pem = jwkToPem(pubKeys.keys[0]);
    if (!pem) {
      // Invalid kid
      throw new Error("null or missing pem");
    }

    // throws error if expired, invalid, or verification failure
    const verified = jwt.verify(idToken, pem, {
      issuer: decodedJwt.iss,
    }) as string | object;

    if (typeof verified === "string") {
      throw new Error("JWT result is a string");
    }

    const cognito_user = verified as ICognitoUser;

    if (!cognito_user.sub) {
      throw new Error("Missing sub in verified user");
    }

    // req.user accessable wherever as user's email
    // req.user = cognito_user.email;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).send({ error: "Unauthorized" });
  }
};
