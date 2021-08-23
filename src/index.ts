// import packages
import cors from 'cors';
import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import adminHandler from './routeHandler/adminHandler';
import paymentHandler from './routeHandler/paymentHandler';
import userHandler from './routeHandler/userHandler';
import userImageHandler from './routeHandler/userImageHandler';
import workspaceHandler from './routeHandler/workspaceHandler';
import { app, io, server } from './socket/socket';
import handleSprint from './socketHandler/sprint';
import { createWorkspace, singleWorkspace, userWorkspaces } from './socketHandler/workspace';

config();

// server port
const port = process.env.PORT || 5000;

// express app initialization
app.use(express.json());
app.use(cors());

// database connection with mongoose
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghclx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    )
    .then(() => console.log('Database connected successfully'))
    .catch((error: mongoose.CallbackError) => console.log('ERROR', error));

// all routes
app.use('/payment', paymentHandler);
app.use('/user', userHandler);
app.use('/userImage', userImageHandler);
app.use('/admin', adminHandler);
app.use('/workspace', workspaceHandler);

app.get('/', (req: Request, res: Response) => {
    res.send('Henosis server is running');
});

// workspace section
io.of('/create-workspace').on('connection', createWorkspace);
io.of('/workspace').on('connection', singleWorkspace);
io.of('/user-workspaces').on('connection', userWorkspaces);

// sprint section
io.of('/sprint').on('connection', handleSprint);

// default error handler
// eslint-disable-next-line consistent-return
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
}

app.use(errorHandler);

server.listen(port, () => {
    console.log(`Boss! I am listening at http://localhost:${port}`);
});
