import mongoose from 'mongoose';
import sprintSchema from '../schemas/sprintSchema';
import workspaceSchema from '../schemas/workspaceSchemas';
import { io, ISocket } from '../socket/socket';

const Sprint = mongoose.model('sprint', sprintSchema);
const Workspace = mongoose.model('workspace', workspaceSchema);

const handleSprint = (socket: ISocket): void => {
    socket.on('join-sprint', (id) => {
        socket.join(id);
    });

    socket.on('create-sprint', async (sprint) => {
        const newSprint = new Sprint(sprint);
        await newSprint.save((error: mongoose.CallbackError, result: any) => {
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

    socket.on('add-task', async (_id, tasks, user) => {
        const data = await Sprint.findByIdAndUpdate(
            { _id },
            { $set: { tasks } },
            { useFindAndModify: false, new: true },
            (error) => {
                if (error) {
                    console.log(error);
                }
            },
        );
        if (user) {
            io.of('/sprint').in(data.workspaceId).emit('added-task', data.tasks, user);
        } else {
            socket.to(data.workspaceId).emit('added-task', data.tasks);
        }
    });

    socket.on('add-member', async (_id, members) => {
        const data = await Workspace.findByIdAndUpdate(
            { _id },
            { $set: { members } },
            { useFindAndModify: false, new: true },
            (error) => {
                if (error) {
                    console.log(error);
                }
            },
        );
        io.of('/sprint').in(_id).emit('added-member', data.members);
    });
};

export default handleSprint;