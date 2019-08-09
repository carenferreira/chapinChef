const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    message: {},
    context: {}
})

module.exports = mongoose.model('User', userSchema);