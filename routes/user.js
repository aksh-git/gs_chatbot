import { Router } from 'express';
import { generateUsername } from 'unique-username-generator';
import User from '../lib/db/models/User.js';
import fetchuser from '../lib/middleware/fetchUser.js';

const userRoute = Router();

// Get random username
userRoute.get('/randomUser', async (req, res) => {
    try {
        const p = new Promise(async (resolve, reject) => {
            while (true) {
                var username = generateUsername("_", 3, 20)
                const user = await User.findOne({ secret: username });
                if (!user) {
                    resolve(username);
                    return;
                }
            }
        })
        let username = await p.then((result) => { return result });
        return res.status(200).json({ success: true, username: username })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Something went wrong." })
    }
})

// Get chats : with no params returns last 10 messages
userRoute.get('/getChat', fetchuser, async (req, res) => {
    try {
        const { userId } = req.user;
        const params = req.query;

        const next = Object.keys(params).includes("next")
        const rangeFrom = Object.keys(params).includes("from") ? parseInt(params.from) : -1;
        const rangeTo = Object.keys(params).includes("to") ? parseInt(params.to) : 10;
        const last = Object.keys(params).includes("to") ? parseInt(params.last) : 10;

        let user = await User.findById(userId);
        let result;

        if (next) {
            if (rangeFrom === -1) {
                return res.status(200).json({ success: false, error: "Invalid Range" })
            }
            // Return next 10
            const result = user.chatHistory.slice(rangeFrom, rangeFrom + 10);
            return res.status(200).json({ success: true, data: result });
        }

        result = user.chatHistory.slice(-last);

        return res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Something went wrong." })
    }
})

export default userRoute;