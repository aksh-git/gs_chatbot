import mongoose from 'mongoose';

let isConnected = false;

function connectToMongoDb() {
    if (isConnected) return
    // settings
    mongoose.set('strictQuery', true);
    if (process.env.DEBUG) mongoose.set('debug', true);
    // connection 
    mongoose.connect(process.env.MONGO_URI)
    // handling connection error
    mongoose.connection.on('error', err => {
        console.log("\t[MongoDB Connection ERROR]", err);
        isConnected = false;
    });
}

export default connectToMongoDb;