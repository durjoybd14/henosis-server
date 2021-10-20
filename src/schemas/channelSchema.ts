import { Schema } from 'mongoose';

const channelSchema = new Schema({
    chatName: String,
    workspaceId: String,
    users: [String],
});

export default channelSchema;
