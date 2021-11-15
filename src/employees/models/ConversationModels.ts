import { Schema, model } from 'mongoose';
import { Conversation } from 'eyerate';

export const ConversationSchema: Schema = new Schema({}, { collection: 'Conversations' });

const ConversationModel = model<Conversation>('Conversations', ConversationSchema);
export default ConversationModel;
