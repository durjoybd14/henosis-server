import { Schema } from 'mongoose';

const sprintSchema = new Schema({
    status: [String],
    tasks: [
        {
            taskName: String,
            currentStatus: String,
            dueDate: Date,
            assignedMember: [String],
        },
    ],
    sprintName: String,
    startDate: Date,
    endDate: Date,
    workspaceId: String,
    goals: [String],
});

export default sprintSchema;
