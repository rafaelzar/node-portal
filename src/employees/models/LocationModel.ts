import { Schema, model } from 'mongoose';
import { Location } from 'eyerate';

export const LocationSchema: Schema = new Schema({}, { collection: 'Locations' });

const LocationModel = model<Location>('Locations', LocationSchema);
export default LocationModel;
