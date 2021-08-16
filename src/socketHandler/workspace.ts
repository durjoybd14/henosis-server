import mongoose from 'mongoose';
import IWorkspace from '../interfaces/workspaceInterface';
import workspaceSchema from '../schemas/workspaceSchemas';
import sendMail, { IMailData } from '../sendMail/sendMail';
import { ISocket } from '../socket/socket';

const Workspace = mongoose.model('workspace', workspaceSchema);

export const createWorkspace = (socket: ISocket): void => {
    socket.on('create-workspace', async (workspace) => {
        const newWorkspaceData = { ...workspace };
        if (workspace.memberEmail) {
            delete newWorkspaceData.memberEmail;
        }
        const newWorkspace = new Workspace(newWorkspaceData);
        await newWorkspace.save((error: mongoose.CallbackError, result: IWorkspace) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('workspace-created', result._id);
            }
        });
    });
};

export const singleWorkspace = (socket: ISocket): void => {
    socket.on('workspace', async ({ id, userEmail }: { id: string; userEmail: string }) => {
        await Workspace.find({ _id: id }, (error, result: IWorkspace[]) => {
            if (error) {
                socket.emit(
                    'workspace-error',
                    error.message.includes('ObjectId')
                        ? 'There have no workspace'
                        : 'Server side Error',
                );
            } else if (result[0]) {
                const isAuthorized = result[0].members.find((member) => member.email === userEmail);
                if (isAuthorized) {
                    socket.emit('workspace-receive', result[0]);
                } else {
                    const creator = result[0].members.find((member) => member.isCreator) || {
                        email: '',
                    };
                    socket.emit(
                        'workspace-error',
                        'Access denied: Unauthorized',
                        creator.email,
                        result[0].workspaceName,
                    );
                }
            } else {
                socket.emit('workspace-error', 'There have no workspace');
            }
        });
    });

    socket.on('send-access-email', async (mailData: IMailData) => {
        try {
            const messageId = await sendMail(mailData);
            if (messageId) {
                socket.emit('mail-sended', {
                    message: 'Mail Sended Successfully!',
                    isSended: true,
                });
            }
        } catch {
            socket.emit('mail-sended', {
                message: 'Mail Not Sended Successfully!',
                isSended: false,
            });
        }
    });
};

export const userWorkspaces = (socket: ISocket): void => {
    socket.on('request-user-workspaces', async (email: string) => {
        await Workspace.find({ 'members.email': email }, (error, result: IWorkspace[]) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('response-user-workspaces', result);
            }
        });
    });
};
