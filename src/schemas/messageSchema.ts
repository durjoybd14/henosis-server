import { Schema } from 'mongoose';

const messageSchema = new Schema({
    channelId: String,
    message: String,
    userId: String,
    date: Date,
    seen: [String],
});

export default messageSchema;
