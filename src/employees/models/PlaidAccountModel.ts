import { Schema, model } from 'mongoose';
// import { PlaidAccount } from 'eyerate';
export interface PlaidAccount {
  employee_id: string;
  access_token: string;
}
export const PlaidAccountSchema: Schema = new Schema({}, { collection: 'PlaidAccounts' });

const PlaidAccountModel = model<PlaidAccount>('PlaidAccounts', PlaidAccountSchema);
export default PlaidAccountModel;
