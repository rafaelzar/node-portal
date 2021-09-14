import dotenv from 'dotenv';
import App from './App';

dotenv.config({ path: '.env' });

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
  throw Error('Invalid NODE_ENV');
}
if (!process.env.PORT || isNaN(Number(process.env.PORT))) {
  throw Error('Invalid PORT');
}

if (!process.env.APP_DB_URI || !process.env.APP_DB_URI_DEV) {
  throw Error(
    "Missing APP_DB_URI for this NODE_ENV (must have APP_DB_URI for 'production' and APP_DB_URI_DEV for 'development",
  );
}

if (!process.env.SENDGRID_API_KEY) {
  throw Error('Missing SENDGRID_API_KEY');
}

if (
  !process.env.COGNITO_APP_USER_POOL_ID ||
  !process.env.COGNITO_APP_CLIENT_ID ||
  !process.env.COGNITO_APP_USER_POOL_REGION ||
  !process.env.COGNITO_ISS
) {
  throw Error(
    'Missing some or all Cognito env vars: COGNITO_APP_USER_POOL_ID, COGNITO_APP_CLIENT_ID, COGNITO_APP_USER_POOL_REGION, COGNITO_ISS',
  );
}

export default {
  NODE_ENV: process.env.NODE_ENV,
  APP_PORT: Number(process.env.PORT),

  // mongo
  APP_DB_URI: process.env.APP_DB_URI,

  // sendgrid
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_ADDRESS: String(process.env.EMAIL_ADDRESS),
  EMPLOYEE_TEMPLATE_ID: String(process.env.EMPLOYEE_TEMPLATE_ID),

  //link to fe

  FE_LINK: String(process.env.FE_LINK),

  // cognito
  COGNITO_APP_USER_POOL_ID: process.env.COGNITO_APP_USER_POOL_ID,
  COGNITO_APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID,
  COGNITO_APP_USER_POOL_REGION: process.env.COGNITO_APP_USER_POOL_REGION,
  COGNITO_ISS: process.env.COGNITO_ISS,

  //plaid
  PLAID_CLIENT_ID: String(process.env.PLAID_CLIENT_ID),
  PLAID_SECRET: String(process.env.PLAID_SECRET),
};
