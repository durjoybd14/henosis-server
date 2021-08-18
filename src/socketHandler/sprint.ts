import mongoose from 'mongoose';
import { ISprint, ITask } from '../interfaces/sprintInterface';
import IUser from '../interfaces/userInterface';
import IWorkspace from '../interfaces/workspaceInterface';
import sprintSchema from '../schemas/sprintSchema';
import workspaceSchema from '../schemas/workspaceSchemas';
import { io, ISocket } from '../socket/socket';

const Sprint = mongoose.model('sprint', sprintSchema);
const Workspace = mongoose.model('workspace', workspaceSchema);

const handleSprint = (socket: ISocket): void => {
    socket.on('join-sprint', (id) => {
        socket.join(id);
    });

    socket.on('create-sprint', async (sprint: ISprint) => {
        const newSprint = new Sprint(sprint);
        await newSprint.save((error: mongoose.CallbackError, result: ISprint) => {
            if (error) {
                console.log(error);
            } else {
                io.of('/sprint').in(result.workspaceId).emit('created-sprint', result);
            }
        });
    });

    socket.on('current-sprint', async (workspaceId: string) => {
        const date = new Date();
        await Sprint.find({ workspaceId, endDate: { $gte: date } }, (error, result: ISprint[]) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('send-current-sprint', result[0]);
            }
        });
    });

    socket.on('add-task', async (_id: string, tasks: ITask[], user: IUser) => {
        const data: ISprint = await Sprint.findByIdAndUpdate(
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
        const data: IWorkspace = await Workspace.findByIdAndUpdate(
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

    socket.on('add-status', async (_id: string, status: string[]) => {
        const data: ISprint = await Sprint.findByIdAndUpdate(
            { _id },
            { $set: { status } },
            { useFindAndModify: false, new: true },
            (error) => {
                if (error) {
                    console.log(error);
                }
            },
        );
        io.of('/sprint').in(data.workspaceId).emit('added-status', data.status);
    });
};

export default handleSprint;
