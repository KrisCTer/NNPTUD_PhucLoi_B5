let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username khong duoc trung"],
        required: [true, "username la bat buoc"]
    },
    password: {
        type: String,
        required: [true, "password la bat buoc"]
    },
    email: {
        type: String,
        unique: [true, "email khong duoc trung"],
        required: [true, "email la bat buoc"]
    },
    fullName: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: "https://i.sstatic.net/l60Hf.png"
    },
    status: {
        type: Boolean,
        default: false
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'role'
    },
    loginCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('user', userSchema);
