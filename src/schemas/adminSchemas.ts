import { Schema } from 'mongoose';

const adminSchema = new Schema({
    name: String,
    email: String,
    role: String,
});

export default adminSchema;
