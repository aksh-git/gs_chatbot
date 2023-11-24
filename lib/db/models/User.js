import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    secret: {
        type: String,
        required: true,
    },
    // TO be used later
    alias: {
        type: String,
    },
    chatHistory: {
        type: []
    }
}, { timestamps: true });

const User = mongoose.model("user", userSchema);

export default User;