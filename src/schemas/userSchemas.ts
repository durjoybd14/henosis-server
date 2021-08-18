import { Schema } from 'mongoose';

const userSchema = new Schema({
    name: String,
    email: String,
    imageURL: String,
    githubLink: String,
    location: String,
    bio: String,
});

export default userSchema;
