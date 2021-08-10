const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();

const adminSchemas = require('../schemas/adminSchemas');

const Admins = new mongoose.model('Admins', adminSchemas);

router.post('/', (req, res) => {
    const newAdmin = new Admins(req.body);
    newAdmin.save((err) => {
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

module.exports = router;
