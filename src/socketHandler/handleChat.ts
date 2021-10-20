import mongoose, { CallbackError, Document } from 'mongoose';
import IChannel, { IMessage } from '../interfaces/channelInterface';
import channelSchema from '../schemas/channelSchema';
import messageSchema from '../schemas/messageSchema';
import { io, ISocket } from '../socket/socket';
import User from '../utils/users';

interface ICall {
    user: string;
    id: string;
    signal: string;
}

const users = new User();

const Channel = mongoose.model('chat-channel', channelSchema);

const Message = mongoose.model('chat-message', messageSchema);

interface IJoin {
    _id: string;
    userId: string;
}

const handleChat = (socket: ISocket): void => {
    socket.on('join-workspace', async ({ _id, userId }: IJoin) => {
        socket.join(_id);
        users.removeUser(socket.id);
        users.addUser({ id: socket.id, userId, workspaceId: _id });
        io.of('/chat').in(_id).emit('change-activeList', users.getUserList(_id));
    });

    socket.on('call-send', async ({ user, id, signal }: ICall) => {
        socket.to(id).emit('call-sended', { signal, user });
    });

    socket.on('disconnect', () => {
        const user = users.removeUser(socket.id);

        if (user) {
            io.of('/chat')
                .in(user.workspaceId)
                .emit('change-activeList', users.getUserList(user.workspaceId));
        }
    });

    socket.on('join-channel', (id: string, previous: string, callback: () => void) => {
        if (previous) {
            socket.leave(previous);
        }
        socket.join(id);
        callback();
    });

    // eslint-disable-next-line no-unused-vars
    socket.on('create-channel', async (channel: IChannel, callback: (id: string) => void) => {
        const newChannel = new Channel(channel);
        newChannel.save((error: CallbackError, result: Document) => {
            if (error) {
                console.log(error);
            } else {
                if (callback) {
                    callback(result.id);
                }
                io.of('/chat').in(channel.workspaceId).emit('created-channel', result);
            }
        });
    });

    socket.on('message-send', async (message: IMessage) => {
        const newMessage = new Message(message);
        newMessage.save((error: CallbackError, result: Document) => {
            if (error) {
                console.log(error);
            } else {
                io.of('/chat').in(message.channelId).emit('message-sended', result);
            }
        });
    });

    socket.on(
        'previous-message',
        (
            { channelId, messageCount }: { channelId: string; messageCount: number },
            // eslint-disable-next-line no-unused-vars
            callback: (error?: Error, messages?: IMessage[]) => void,
        ) => {
            Message.find({ channelId }, (err, messages: IMessage[]) => {
                if (err) {
                    callback({ message: 'Internal Server Error', name: '' });
                } else if (messages.length) {
                    callback(undefined, [...messages].reverse());
                } else {
                    callback({ message: 'No Message Found', name: '' });
                }
            })
                .sort({ _id: -1 })
                .skip(messageCount)
                .limit(20);
        },
    );

    socket.on(
        'workspace-channels',
        // eslint-disable-next-line no-unused-vars
        async (workspaceId: string, callback: (error?: Error, result?: IChannel[]) => void) => {
            Channel.find({ workspaceId }, (err, result: IChannel[]) => {
                if (err) {
                    callback({ name: '', message: 'Internal Server Error' });
                } else if (result.length) {
                    callback(undefined, result);
                } else {
                    callback({ name: '', message: 'No channel found' });
                }
            });
        },
    );
};

export default handleChat;
