import express from 'express';
import mongoose from 'mongoose';
import adminSchemas from '../schemas/adminSchemas';

const router = express.Router();

const Admins = mongoose.model('Admins', adminSchemas);

router.post('/', (req, res) => {
    const newAdmin = new Admins(req.body);
    newAdmin.save((err: mongoose.CallbackError) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                message: 'New Admin info was recorded successfully!',
            });
        }
    });
});

router.get('/', (req, res) => {
    Admins.find({}, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                data,
                message: 'Admins info collection successful',
            });
        }
    });
});

router.delete('/:id', (req, res) => {
    Admins.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                message: 'Admin was deleted successfully!',
            });
        }
    });
});

export default router;
