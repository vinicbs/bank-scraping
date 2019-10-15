import * as mongoose from 'mongoose';
import Itau from './itau.interface';

const itauSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const itauModel = mongoose.model<Itau & mongoose.Document>('Itau', itauSchema);

export default itauModel;