import mongoose from 'mongoose';
import IUser from '../interfaces/userInterface';
import IWorkspace, { IMember } from '../interfaces/workspaceInterface';
import userSchema from '../schemas/userSchemas';
import workspaceSchema from '../schemas/workspaceSchemas';
import sendMail, { IMailData } from '../sendMail/sendMail';
import { io, ISocket } from '../socket/socket';

const Workspace = mongoose.model('workspace', workspaceSchema);

const User = mongoose.model('User', userSchema);

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
    socket.on('join-workspace', (id) => {
        socket.join(id);
    });

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
                    isRedirect: !mailData.path,
                });
                if (mailData.path) {
                    const sended = mailData.toEmail.split(', ');
                    const sendedMails = [...mailData.previousMails, ...sended];
                    await Workspace.updateOne(
                        { _id: mailData.id },
                        {
                            $set: { previousMails: sendedMails },
                        },
                        {},
                        (error) => {
                            if (error) {
                                console.log(error);
                            }
                        },
                    );
                }
            }
        } catch (error) {
            socket.emit('mail-sended', {
                message: 'Mail Not Sended Successfully!',
                isSended: false,
                isRedirect: !mailData.path,
            });
        }
    });

    socket.on('add-member', async (_id: string, members: IMember[], previousMails?: string[]) => {
        interface ISet {
            members: IMember[];
            previousMails?: string[];
        }
        let mySet: ISet = { members };
        if (previousMails) {
            mySet = { members, previousMails };
        }
        const data: IWorkspace = await Workspace.findByIdAndUpdate(
            { _id },
            { $set: mySet },
            { useFindAndModify: false, new: true },
            (error) => {
                if (error) {
                    console.log(error);
                }
            },
        );
        io.of('/workspace').in(_id).emit('added-member', data.members);
        if (previousMails) {
            socket.emit('added-member');
        }
    });

    socket.on('userData', async (email: string) => {
        await User.find({ email }, (error, result: IUser[]) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('userData-receive', result[0]);
            }
        });
    });

    socket.on('is-email-sended', async ({ _id, email }: { _id: string; email: string }) => {
        await Workspace.find({ _id }, (error, result: IWorkspace[]) => {
            if (error) {
                socket.emit('request-error');
            } else if (result[0]) {
                const isSended = result[0].previousMails.find((em) => em === email);
                socket.emit(
                    'is-sended-reply',
                    !!isSended,
                    result[0].members,
                    result[0].previousMails,
                );
            } else {
                socket.emit('request-error');
            }
        });
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
