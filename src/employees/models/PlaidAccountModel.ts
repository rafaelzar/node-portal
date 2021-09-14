import { Schema, model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PlaidAccount } from 'eyerate';
export const PlaidAccountSchema: Schema = new Schema(
  {
    access_token: {
      type: String,
    },
    employee: {
      type: ObjectId,
    },
  },
  { collection: 'PlaidAccounts' },
);

const PlaidAccountModel = model<PlaidAccount>('PlaidAccounts', PlaidAccountSchema);
export default PlaidAccountModel;
