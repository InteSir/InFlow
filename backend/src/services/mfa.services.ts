import { Env } from "../config/env.config";
import { HTTPSTATUS } from "../config/http.config";
import { Request,Response } from "express";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/app-error";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import userModel from "../models/user.model";
import SessionModel from "../models/session.model";
import { accessTokenSignOptions, refreshTokenSignOptions, SignJwtToken } from "../utils/jwt";
import ReportSettingModel from "../models/report-setting.model";

export const generateMFASetupService = async(req:Request)=>{
    const reqUser = req.user;

    if (!reqUser) {
        throw new UnauthorizedException("User not authorized");
    }
    const user = await userModel.findById(reqUser._id);

    if(!user){
            throw new UnauthorizedException("User not authorized");
    }
    if(user.userPreference.enable2FA){
            return{
                message:"MFA already enabled",
            };
    }


    let secretKey = user.userPreference.twoFactorSecret;
    if(!secretKey){
        const secret = speakeasy.generateSecret({name:"InAr"});
        secretKey = secret.base32;
        user.userPreference.twoFactorSecret = secretKey;
        await user.save()
    }

    const url = speakeasy.otpauthURL({
        secret:secretKey,
        label:`${user.name}`,
        issuer:"inarFlow.com",
        encoding:"base32",
    });

     const qrImageUrl = await qrcode.toDataURL(url);
        return {
            message:"Scan the QR code or use the setop key.",
            secret:secretKey,
            qrImageUrl,
    }


    



}


export const verifyMFASetupService = async(req:Request,code:string,secretKey:string)=>{
    const reqUser = req.user;

    if (!reqUser) {
        throw new UnauthorizedException("User not authorized");
    }
    const user = await userModel.findById(reqUser._id);

    if(!user){
            throw new UnauthorizedException("User not authorized");
    }
    if(user.userPreference.enable2FA){
            return{
                message:"MFA already enabled",
                userPreferences:{
                    enable2FA:user.userPreference.enable2FA,
                }
            };
        }
    const isValid = speakeasy.totp.verify({
            secret:secretKey,
            encoding:"base32",
            token:code,
    });

    if(!isValid){
            throw new BadRequestException("Invalid MFA code.Please try again");
    }
    user.userPreference.enable2FA = true;

    await user.save();

    return {
             message:"MFA setup completed successfully",
            userPreferences:{
                    enable2FA:user.userPreference.enable2FA,
                },
        };


};



export const revokeMFAService= async(req:Request)=>{
    const reqUser = req.user;

    if (!reqUser) {
        throw new UnauthorizedException("User not authorized");
    }
    const user = await userModel.findById(reqUser._id);
    if(!user){
        throw new UnauthorizedException("User not authorized");
    }
    if(!user.userPreference.enable2FA){
        return{
            message:"MFA is not eanbled",
            userPreferences:{
                enable2FA:user.userPreference.enable2FA,
            },
        };
    }

    user.userPreference.twoFactorSecret = undefined;
    user.userPreference.enable2FA = false;
    await user.save();

    return{
                message:"MFA is revoked succesfully",
                userPreferences:{
                    enable2FA:user.userPreference.enable2FA,
                },
            };
};


export const verifyMFALoginService =  async(code:string,email:string,userAgent?:string)=>{

        const user = await userModel.findOne({email});
        if(!user){
            throw new NotFoundException("User not found");
        }
        if(!user.userPreference.enable2FA && !user.userPreference.twoFactorSecret){
            throw new UnauthorizedException("MFA not enabled for this user");
        }

        const isValid =  speakeasy.totp.verify({
            secret: user.userPreference.twoFactorSecret!,
            encoding:"base32",
            token:code,
        });

        if(!isValid){
            throw new BadRequestException("Invalid MFA code.please ry again")
        };

        const session = await SessionModel.create({
              userId: user._id,
              userAgent,
        });

        
       const{token,expiresAt}  = SignJwtToken({userId:user.id,sessionId:session._id.toString()},accessTokenSignOptions);
       const {token:refreshToken} = SignJwtToken({sessionId:session._id.toString()} as any,refreshTokenSignOptions);
        
        
       const reportSetting = await ReportSettingModel.findOne({userId:user.id},{_id:1,frequency:1,isEnabled:1}).lean();
        
        return{
                user:user.omitPassword(),
                accessToken:token,
                expiresAt,
                refreshToken,
                reportSetting,
        
                }


};