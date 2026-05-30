import mongoose from 'mongoose';
import { Env } from './env.config';

const connectDB = async()=>{
    try{
        await mongoose.connect(Env.MONGO_URI,{
            serverSelectionTimeoutMS:8000,//When your app starts and Finding the Server,If it can't find one within 8 seconds it will stop trying and throw an error.
            socketTimeoutMS:45000,//This is the time allowed to establish the initial connection between your Node.js server and MongoDB.
            connectTimeoutMS:10000,//Once connected, this is how long the app will wait for a response during a specific operation
        });

        console.log('Connected to MongoDB successfully');
    }catch(error){
        console.log("Error connecting to the MongoDB database",error);
        process.exit(1);
    }
};
export default connectDB;