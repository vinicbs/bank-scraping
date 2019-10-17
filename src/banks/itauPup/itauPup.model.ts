import * as mongoose from 'mongoose';
import ItauPup from './itauPup.interface';

const itauPupSchema = new mongoose.Schema({
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
    },
    branch: String,
    account: String,
    password: String
})

const itauPupModel = mongoose.model<ItauPup & mongoose.Document>('User', itauPupSchema);

export default itauPupModel;