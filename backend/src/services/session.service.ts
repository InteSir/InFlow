import mongoose from "mongoose";
import SessionModel from "../models/session.model";
import { NotFoundException } from "../utils/app-error";



export const getAllSessionService = async(userId:string)=>{


    const sessions = await SessionModel.find(
        {
        userId,
        expiredAt:{$gt:Date.now()},

        },{
            _id:1,
            userId:1,
            userAgent:1,
            createdAt:1,
            expiredAt:1,
        },{
            sort:{
                    createdAt:-1,
                },
        }
    );

    return{
        sessions,
    }



};

export const  getSessionService = async(sessionId:string)=>{
     const session = await SessionModel.findById(sessionId).populate("userId").select("-expiresAt");
     if(!session){
            throw new NotFoundException("Session Not Found");

        }
    const {userId:user} = session; 
            return {user,};
    };


export const  deleteSessionService = async(sessionId:string,userId:string)=>{
        const deletedSession = await SessionModel.findByIdAndDelete({
            _id:sessionId,
            userId:userId,
        });
        if(!deletedSession){
            throw new NotFoundException("Session not found");

        }
        return; 
};