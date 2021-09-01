import express from 'express';
import mongoose from 'mongoose';
import sprintSchema from '../schemas/sprintSchema';

const router = express.Router();

const Sprint = mongoose.model('sprint', sprintSchema);

router.get('/:id', async (req, res) => {
    try {
        const data = await Sprint.find({ workspaceId: req.params.id });
        res.status(200).json({
            data,
            message: 'Sprint info by workspaceId was collected successfully!',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server side error!',
        });
    }
});

export default router;
