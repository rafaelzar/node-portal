import { Schema, model } from 'mongoose';
import { Mention } from 'eyerate';

export const MentionSchema: Schema = new Schema({}, { collection: 'Mentions' });

const MentionModel = model<Mention>('Mentions', MentionSchema);
export default MentionModel;
