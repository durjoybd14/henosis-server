const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();

const userSchema = require('../schemas/userSchemas');

const User = new mongoose.model('User', userSchema);

router.post('/', (req, res) => {
    const user = new User(req.body);
    user.save((err) => {
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

module.exports = router;
