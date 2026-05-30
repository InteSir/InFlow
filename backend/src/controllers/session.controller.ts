import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHanlder.middleware";
import { Request,Response } from "express";
import { NotFoundException } from "../utils/app-error";
import { deleteSessionService, getAllSessionService, getSessionService } from "../services/session.service";
import z from "zod";



export const getAllSessionController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;
  

    const sessionId = req.sessionId;

    const {sessions} = await getAllSessionService(userId);

    const modifySessions = sessions.map((session)=>({
        ...session.toObject(),
        ...(session.id === sessionId && {
            isCurrent:true,
        })
    }));
    res.status(HTTPSTATUS.OK).json({
            message:"Retrieved all session successfully",
            sessions:modifySessions,
    });


});
export const getSessionController = asyncHandler(async(req:Request,res:Response)=>{
    const sessionId = req?.sessionId;
        if(!sessionId){
            throw new NotFoundException("Session Id not found.Please try to log in");
        }
        const {user} = await getSessionService(sessionId);
        
        res.status(HTTPSTATUS.OK).json({
            message:"Session retrieved successfully",
            user,
        });
});

export const deleteSessionController = asyncHandler(async(req:Request,res:Response)=>{
        const sessionId = z.string().parse(req.params.id);
        const userId = req.user?._id;

        await deleteSessionService(sessionId,userId)
        res.status(HTTPSTATUS.OK).json({
            message:"Session removed successfully",

        });

});
