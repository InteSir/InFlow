import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHanlder.middleware";
import { Request,Response } from "express";
import { generateMFASetupService, revokeMFAService, verifyMFALoginService, verifyMFASetupService } from "../services/mfa.services";
import {z} from "zod";
import { setRefreshTokenCookie } from "../utils/cookie";

export const generateMFASetupController = asyncHandler(async(req:Request,res:Response)=>{
    const {message,secret,qrImageUrl}  = await generateMFASetupService(req);
    res.status(HTTPSTATUS.OK).json({
        message,
        secret,
        qrImageUrl,
      });

});


export const verifyMFASchema = z.object({
    code: z.string().trim().min(1).max(6),
    secretKey: z.string().trim().min(1),
});

export const verifyMFALoginSchema = z.object({
    code: z.string().trim().min(1).max(6),
    email:z.string().trim().email().min(1),
    userAgent:z.string().optional(),
});

export const verifyMFASetupController = asyncHandler(async(req:Request,res:Response)=>{
    const {code,secretKey} = verifyMFASchema.parse({...req.body,});

    const {userPreferences,message} = await verifyMFASetupService(req,code,secretKey);

     res.status(HTTPSTATUS.OK).json({
        message: message,
        userPreferences: userPreferences,
      });
});

export const revokeMFAController = asyncHandler(async(req:Request,res:Response)=>{
    const { message, userPreferences } = await revokeMFAService(req);
      res.status(HTTPSTATUS.OK).json({
        message: message,
        userPreferences: userPreferences,
      });
});


export const verifyMFALoginController = asyncHandler(async(req:Request,res:Response)=>{
     const { code, email, userAgent } = verifyMFALoginSchema.parse({
        ...req.body,
        userAgent: req.headers['user-agent'],
      });

       const { user, accessToken, refreshToken } =  await verifyMFALoginService(code, email, userAgent);

      return setRefreshTokenCookie(res,refreshToken,)
        .status(HTTPSTATUS.OK)
        .json({
          message: 'User verified and login successfully',
          user,
          accessToken
        });

        


});

