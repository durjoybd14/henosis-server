const { Schema } = require('mongoose');

const adminSchema = Schema({
    name: String,
    email: String,
    role: String,
});

module.exports = adminSchema;
