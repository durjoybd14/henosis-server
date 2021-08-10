const mongoose = require('mongoose');
const sprintSchema = require('../schemas/sprintSchema');
const { io } = require('../socket/socket');

const Sprint = new mongoose.model('sprint', sprintSchema);

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
};

module.exports = { handleSprint };
