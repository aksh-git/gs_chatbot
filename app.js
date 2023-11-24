import express from "express";
import * as url from "url";
import { Server } from "socket.io";
import { openai } from './lib/ai/openai.js'
import dotenv from 'dotenv';
import userRoute from "./routes/user.js";
import User from "./lib/db/models/User.js";
import verifyToken from "./lib/middleware/verifyToken.js";
import connectToMongoDb from "./lib/db/mongo.js";
import jwt from "jsonwebtoken";

dotenv.config();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const port = process.env.PORT || 6060;

const app = express();

app.use(express.static('./public')); // serving static files
app.use(express.urlencoded({ extended: true })); // accepting URL encodings
app.use(express.json());

// Making database connection 
connectToMongoDb();

// api route for user
app.use('/api/user', userRoute);

// 404 NOt found handler
app.use('*', (req, res, next) => {
    res.send("Welcome to ai");
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Initialize Web socket server
const io = new Server(server);

// Web Socket handler
io.on("connection", (socket) => {

    // Initialize the conversation history
    const conversationHistory = [];

    socket.on("sendMessage", async ({ message, token }, callback) => {
        try {
            if (message.length <= 1) {
                socket.emit('TOO_SHORT', "PLease write more")
            }
            conversationHistory.push({ role: "user", content: message })
            let valid_user;
            if (token) {
                valid_user = verifyToken(token)
                if (!valid_user) {
                    socket.emit("UN_AUTHORISED")
                }
            }
            // TODO : load converstation from db
            if (conversationHistory.length < 0) {

            }

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: conversationHistory.slice(-6), // use only last 6 messages
            });

            const response = completion.choices[0];

            const user = await User.findById(valid_user.userId)
            if (!user) throw new Error("Unknown User.")
            
            // Add the assistant's response to the chat history
            conversationHistory.push({ role: "assistant", content: response.message.content })

            // Saving chat history to database
            user.chatHistory.push({
                user: message,
                assistant: response.message.content,
                timestamp: Date.now()
            })
            user.save();

            socket.emit("response", response);
            callback();
        } catch (error) {
            console.error(error);
            callback("Error: Unable to connect to the bot");
        }
    });

    socket.on("disconnect", () => {
        //console.log("User disconnected");
    });

    socket.on("createSession", async (data, callback) => {
        try {
            let user = await User.findOne({ secret: data.secret })
            if (!user) {
                // Create new user using secret
                const { alias, secret } = data;
                if (alias.length < 3 || secret.length < 5) {
                    socket.emit("Data is too short.")
                }
                user = await User.create({
                    alias: alias,
                    secret: secret
                })
            }
            const token = jwt.sign({
                userId: user.id
            }, process.env.JWT_SECRET);
            socket.emit("sessionResponse", { token })
        } catch (error) {
            console.error(error);
            callback("Error: Unable to connect to the chatbot");
        }
    })
});

