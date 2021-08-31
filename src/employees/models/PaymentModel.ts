import { Schema, model } from 'mongoose';
import { Payment } from 'eyerate';
export const PaymentSchema: Schema = new Schema({}, { collection: 'Payments' });

const PaymentModel = model<Payment>('Payments', PaymentSchema);
export default PaymentModel;
