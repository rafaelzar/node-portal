export default interface ICognitoUser {
  sub: string;
  email_verified: boolean;
  iss: string;
  phone_number_verified: boolean;
  "cognito:username": string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: Date;
  phone_number: string;
  exp: Date;
  iat: Date;
  jti: string;
  email: string;
}
