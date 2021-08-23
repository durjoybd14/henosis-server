import { Schema } from 'mongoose';

const userImagesSchema = new Schema({
    email: String,
    imageURL: String,
});

export default userImagesSchema;
