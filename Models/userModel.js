const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        require: [true, "A User must give fullname"]
    },

    email: {
        type: String,
        require: [true, 'A User must give his email'],
        unique: true
    },

    password: {
        type: String,
        require: [true, 'A User must provide his password']
    },

    consecutiveAttempts: {
        type: Number,
        default: 0
    },

    blocked: {
        type: Boolean,
        default: false
    },

    blockEndTime: {
        type: Date
    },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;