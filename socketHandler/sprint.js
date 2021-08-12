const mongoose = require('mongoose');
const sprintSchema = require('../schemas/sprintSchema');
const { io } = require('../socket/socket');

const Sprint = new mongoose.model('sprint', sprintSchema);

const workspaceSchema = require('../schemas/workspaceSchemas');

const Workspace = new mongoose.model('workspace', workspaceSchema);

const handleSprint = (socket) => {
    socket.on('join-sprint', (id) => {
        socket.join(id);
    });

    socket.on('create-sprint', async (sprint) => {
        const newSprint = new Sprint(sprint);
        await newSprint.save((error, result) => {
            if (error) {
                console.log(error);
            } else {
                io.of('/sprint').in(result.workspaceId).emit('created-sprint', result);
            }
        });
    });

    socket.on('current-sprint', async (workspaceId) => {
        const date = new Date();
        await Sprint.find({ workspaceId, endDate: { $gte: date } }, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('send-current-sprint', result[0]);
            }
        });
    });

    socket.on('add-task', async (_id, tasks) => {
        const data = await Sprint.findByIdAndUpdate(
            { _id },
            { $set: { tasks } },
            { useFindAndModify: false },
            (error) => {
                if (error) {
                    console.log(error);
                }
            },
        );
        io.of('/sprint').in(data.workspaceId).emit('added-task', data.tasks);
    });

    socket.on('add-member', async (_id, members) => {
        const data = await Workspace.findByIdAndUpdate(
            { _id },
            { $set: { members } },
            { useFindAndModify: false },
            (error) => {
                if (error) {
                    console.log(error);
                }
            },
        );
        io.of('/sprint').in(_id).emit('added-member', data.members);
    });
};

module.exports = { handleSprint };
