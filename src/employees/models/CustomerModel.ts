import { Schema, model } from 'mongoose';
import { Customer } from 'eyerate';
export const CustomerSchema: Schema = new Schema({}, { collection: 'Customers' });

const CustomerModel = model<Customer>('Customers', CustomerSchema);
export default CustomerModel;
