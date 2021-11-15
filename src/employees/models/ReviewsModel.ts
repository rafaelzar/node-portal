import { Schema, model } from 'mongoose';
import { Review } from 'eyerate';

export const ReviewSchema: Schema = new Schema({}, { collection: 'Reviews' });

const ReviewModel = model<Review>('Reviews', ReviewSchema);
export default ReviewModel;
