import express from 'express';
import mongoose from 'mongoose';
import userSchema from '../schemas/userSchemas';

const router = express.Router();

const User = mongoose.model('User', userSchema);

router.post('/', (req, res) => {
    const user = new User(req.body);
    user.save((err: mongoose.CallbackError) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                message: 'New User info was recorded successfully!',
            });
        }
    });
});

router.get('/', (req, res) => {
    User.find({}, (err, data) => {
        if (err) {
            res.status(500).json({
                error: 'There was a server side error!',
            });
        } else {
            res.status(200).json({
                data,
                message: 'All User info collected successfully!',
            });
        }
    });
});

export default router;
