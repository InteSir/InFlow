
import { asyncHandler } from "../middlewares/asyncHanlder.middleware";
import { Request,Response } from "express";
import { findByIdUserService, updateUserService } from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import { updateUserSchema } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;

    const user = await  findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
        message:"User fetched successfully",
        user,
    })

});

export const updateUserController =  asyncHandler(async(req:Request,res:Response)=>{
      const userId = req.user?._id;
      const body =  updateUserSchema.parse(req.body);
      const profilePic = req.file;


     const user =await updateUserService(userId,body,profilePic);

      return res.status(HTTPSTATUS.OK).json({
            message:"User Profile updated successfully",
            user,
        
    })
})