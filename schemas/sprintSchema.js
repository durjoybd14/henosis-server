const { Schema } = require('mongoose');

const sprintSchema = Schema({
    status: [String],
    tasks: [
        {
            taskName: String,
            currentStatus: String,
            taskTime: String,
            assignedMember: String,
        },
    ],
    sprintName: String,
    startDate: Date,
    endDate: Date,
    workspaceId: String,
    goals: [String],
});

module.exports = sprintSchema;
