import express from 'express';
import mongoose from 'mongoose';
import workspaceSchema from '../schemas/workspaceSchemas';

const router = express.Router();

const Workspace = mongoose.model('Workspace', workspaceSchema);

router.get('/all', (req, res) => {
    Workspace.find({}, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                data,
                message: 'All workspace info collection successful',
            });
        }
    });
});
router.get('/personal', (req, res) => {
    Workspace.find({ type: 'Personal' }, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                data,
                message: 'All workspace info collection successful',
            });
        }
    });
});
router.get('/business', (req, res) => {
    Workspace.find({ type: 'Business' }, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                data,
                message: 'All workspace info collection successful',
            });
        }
    });
});

export default router;
