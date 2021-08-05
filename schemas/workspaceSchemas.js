/* eslint-disable prettier/prettier */
const { Schema } = require('mongoose');

const workspaceSchema = Schema({
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

module.exports = workspaceSchema;
