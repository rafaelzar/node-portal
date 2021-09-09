import plaid from 'plaid';
import ENV from '../env-config';

const plaidClient = new plaid.Client({
  clientID: ENV.PLAID_CLIENT_ID,
  secret: ENV.PLAID_SECRET,
  env: plaid.environments.sandbox,
  options: {},
});

export default plaidClient;
