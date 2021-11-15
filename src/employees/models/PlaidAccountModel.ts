import { Schema, model } from 'mongoose';
import { PlaidAccount } from 'eyerate';

export const PlaidAccountSchema: Schema = new Schema({}, { collection: 'PlaidAccounts' });

const PlaidAccountModel = model<PlaidAccount>('PlaidAccounts', PlaidAccountSchema);
export default PlaidAccountModel;
