import { Schema } from 'mongoose';

const workspaceSchema = new Schema({
    companyName: String,
    companyEmail: String,
    workspaceName: String,
    type: String,
    members: [
        {
            isCreator: Boolean,
            name: String,
            email: String,
            emailVerified: Boolean,
            photo: String,
        },
    ],
});

export default workspaceSchema;
