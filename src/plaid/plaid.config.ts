import plaid from 'plaid';

const plaidClient = new plaid.Client({
  clientID: '612c955cf989fa00110ad096',
  secret: 'ffab01fb032f8064ed01a7f7133dae',
  env: plaid.environments.sandbox,
  options: {},
});

export default plaidClient;
