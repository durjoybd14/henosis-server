// require packages
const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

require('dotenv').config();

const paymentHandler = require('./routeHandler/paymentHandler');

const userHandler = require('./routeHandler/userHandler');

const adminHandler = require('./routeHandler/adminHandler');

const workspaceHandler = require('./routeHandler/workspaceHandler');

const { server, io, app } = require('./socket/socket');
const { createWorkspace, singleWorkspace, userWorkspaces } = require('./socketHandler/workspace');
const { handleSprint } = require('./socketHandler/sprint');

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
    .catch((error) => console.log('ERROR', error));

// all routes
app.use('/payment', paymentHandler);
app.use('/user', userHandler);
app.use('/admin', adminHandler);
app.use('/workspace', workspaceHandler);

app.get('/', (req, res) => {
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
function errorHandler(err, req, res, next) {
    if (res.headerSent) {
        return next(err);
    }
    res.status(500).json({ error: err });
}

app.use(errorHandler);

server.listen(port, () => {
    console.log(`Boss! I am listening to you at port:${port}`);
});
