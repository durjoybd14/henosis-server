// require packages

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const paymentHandler = require('./routeHandler/paymentHandler');

const userHandler = require('./routeHandler/userHandler');

const { server, io, app } = require('./socket/socket');

const { createWorkspace, singleWorkspace, userWorkspaces } = require('./socketHandler/workspace');

require('dotenv').config();

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

app.get('/', (req, res) => {
    res.send('Henosis server is running');
});

// workspace section
const createWorkspaceN = io.of('/create-workspace');
createWorkspaceN.on('connection', createWorkspace);

const singleWorkspaceN = io.of('/workspace');
singleWorkspaceN.on('connection', singleWorkspace);

const userWorkspacesN = io.of('/user-workspaces');
userWorkspacesN.on('connection', userWorkspaces);

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
