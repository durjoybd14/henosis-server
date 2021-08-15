import { Schema } from 'mongoose';

const userSchema = new Schema({
    name: String,
    email: String,
});

export default userSchema;
