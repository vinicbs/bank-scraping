import * as mongoose from 'mongoose';
import User from './users.interface';

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;