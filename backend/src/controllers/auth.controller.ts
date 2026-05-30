import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHanlder.middleware";
import { Request,Response } from "express";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, verificationCodeSchema } from "../validators/auth.validator";
import { forgotPasswordService, googleAuthService, loginService, logoutService, RefreshService, registerService, resetPasswordService, verifyEmailService } from "../services/auth.service";
import { clearAuthenticationCookies, getRefreshTokenCookieOptions, setRefreshTokenCookie} from "../utils/cookie";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";
export const registerController = asyncHandler(async(req:Request,res:Response)=>{
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({message:"User registered successfully",user:result,});
});
export const googleAuthController = asyncHandler(async(req:Request,res:Response)=>{
    const {idToken} = req.body;

    if(!idToken){throw new BadRequestException("Google ID token is required");}

    const userAgent = req.headers["user-agent"];

    const { user, accessToken, expiresAt, refreshToken, reportSetting } =
      await googleAuthService(idToken, userAgent);

     setRefreshTokenCookie(res, refreshToken);

     return res.status(HTTPSTATUS.OK).json({
      message: "Google authentication successful",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });

    
})
export const loginController = asyncHandler(async(req:Request,res:Response)=>{
    const userAgent = req.headers['user-agent']
    const body = loginSchema.parse({
        ...req.body,
        userAgent,
    });


    const {user,accessToken,expiresAt,refreshToken,reportSetting} = await loginService(body);

    
    // Refresh token → httpOnly cookie (JS can't touch it)
    // console.log(jwt.decode(accessToken));

    setRefreshTokenCookie(res, refreshToken);


    return res.status(HTTPSTATUS.OK).json({message:"User logged in successfully",user,accessToken,expiresAt,reportSetting,});

});

export const refreshTokenController = asyncHandler(async(req:Request,res:Response)=>{
        const refreshToken = req.cookies?.refreshToken
        const {user,accessToken,expiresAt,newRefreshToken} = await RefreshService(refreshToken);

        if (newRefreshToken) {
             res.cookie("refreshToken",newRefreshToken,getRefreshTokenCookieOptions());
            
        }

        return res.status(HTTPSTATUS.OK).json({message:"Token refreshed",user,accessToken,expiresAt});

    
});

export const logoutController = asyncHandler(async(req:Request,res:Response)=>{
    const sessionId = req.sessionId;
    console.log("Session ID from req:", req.sessionId);

    if(!sessionId){
        throw new NotFoundException("Session is missing");
    }
    await logoutService(sessionId);

    return clearAuthenticationCookies(res).status(HTTPSTATUS.OK).json({
        message:"User logout successfully",
    })
});


export const forgotPasswordController = asyncHandler(async(req:Request,res:Response)=>{
    const email = emailSchema.parse(req.body.email);

    await forgotPasswordService(email);

    return res.status(HTTPSTATUS.OK).json({
        message:"Password reset email sent",
    })
});


export const resetPasswordController = asyncHandler(async(req:Request,res:Response)=>{
    const body = resetPasswordSchema.parse(req.body);

    await resetPasswordService(body);

    return clearAuthenticationCookies(res).status(HTTPSTATUS.OK).json({
        message:"Reset password successfully",
    });
});


export const verifyEmailController = asyncHandler(async(req:Request,res:Response)=>{
    const code = verificationCodeSchema.parse(req.body.code);

    await verifyEmailService(code);
    return res.status(HTTPSTATUS.OK).json({
            message:"Email verified successfully",
        });


})


export const updateUserController =  asyncHandler(async(req:Request,res:Response)=>{
     await userModel.updateMany(
        { userPreference: { $exists: false } },
        {
            $set: {
            userPreference: {
                enable2FA: false,
                emailNotification: true,
            },
            isEmailVerified: false,
            },
        }
        );
})