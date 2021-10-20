export interface IMessage {
    _id?: string;
    channelId: string;
    message: string;
    userId: string;
    date: Date;
    seen: string[];
}

interface IChannel {
    _id?: string;
    chatName: string;
    workspaceId: string;
    users: string[];
}

export default IChannel;
