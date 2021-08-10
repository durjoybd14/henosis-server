const { Schema } = require('mongoose');

const userSchema = Schema({
    name: String,
    email: String,
});

module.exports = userSchema;
