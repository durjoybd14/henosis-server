import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import workspaceSchema from '../schemas/workspaceSchemas';
import { ISocket } from '../socket/socket';

const Workspace = mongoose.model('workspace', workspaceSchema);

export const createWorkspace = (socket: ISocket): void => {
    socket.on('create-workspace', async (workspace) => {
        const newWorkspaceData = { ...workspace };
        if (workspace.memberEmail) {
            delete newWorkspaceData.memberEmail;
        }
        const newWorkspace = new Workspace(newWorkspaceData);
        await newWorkspace.save((error: mongoose.CallbackError, result: any) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('workspace-created', result._id);
            }
        });
    });
};

export const singleWorkspace = (socket: ISocket): void => {
    socket.on('workspace', async ({ id, userEmail }) => {
        await Workspace.find({ _id: id }, (error, result) => {
            if (error) {
                socket.emit(
                    'workspace-error',
                    error.message.includes('ObjectId')
                        ? 'There have no workspace'
                        : 'Server side Error',
                );
            } else if (result[0]) {
                const isAuthorized = result[0].members.find(
                    (member: any) => member.email === userEmail,
                );
                if (isAuthorized) {
                    socket.emit('workspace-receive', result[0]);
                } else {
                    const creator = result[0].members.find((member: any) => member.isCreator);
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
    socket.on('send-access-email', async ({ email, name }, creatorEmail, workspaceName) => {
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: '<henosisbd@gmail.com>',
                to: creatorEmail,
                subject: 'Send Access Request',
                text: 'Henosis',
                html: `
                <b>${name} Send an access Request For ${workspaceName} workspace</b>
                <br/>
                <br/>
                <b>User Details</b>
                <ul>
                    <li>name: ${name}</li>
                    <li>email: ${email}</li>
                </ul>
                `,
            });
            socket.emit('mail-sended', 'Mail Sended Successfully');
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        } catch (e) {
            console.log(e);
        }
    });
};

export const userWorkspaces = (socket: ISocket): void => {
    socket.on('request-user-workspaces', async (email) => {
        await Workspace.find({ 'members.email': email }, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('response-user-workspaces', result);
            }
        });
    });
};
