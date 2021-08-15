import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export const app = express();

export const server = createServer(app);
export const io = new Server(server, {
    cors: { origin: '*' },
});

export type ISocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;
