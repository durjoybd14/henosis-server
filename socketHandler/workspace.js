const mongoose = require('mongoose');

const workspaceSchema = require('../schemas/workspaceSchemas');

const Workspace = new mongoose.model('workspace', workspaceSchema);

const createWorkspace = (socket) => {
    socket.on('create-workspace', async (workspace) => {
        const newWorkspaceData = { ...workspace };
        if (workspace.memberEmail) {
            delete newWorkspaceData.memberEmail;
        }
        const newWorkspace = new Workspace(newWorkspaceData);
        await newWorkspace.save((error, result) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('workspace-created', result._id);
            }
        });
    });
};

const singleWorkspace = (socket) => {
    socket.on('workspace', async (id) => {
        await Workspace.find({ _id: id }, (error, result) => {
            if (error) {
                console.log(error);
            } else {
                socket.emit('workspace-receive', result[0]);
            }
        });
    });
};

const userWorkspaces = (socket) => {
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

module.exports = { createWorkspace, singleWorkspace, userWorkspaces };
