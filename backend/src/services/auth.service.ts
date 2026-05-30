import { Env } from "../config/env.config";
import { HTTPSTATUS } from "../config/http.config";
import { VerificationEnum } from "../enums/verification.enum";
import { sendEmail } from "../mailer/mailer";
import { passwordResetTemplate, verifyEmailTemplate } from "../mailer/templates/reportTemplate";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report-setting.model";
import SessionModel from "../models/session.model";
import userModel from "../models/user.model";
import VerificationCodeModel from "../models/verification.model";
import { BadRequestException, HttpException, InternalServerException, NotFoundException, UnauthorizedException } from "../utils/app-error";
import { hashValue } from "../utils/bcrypt";
import { calculateExpirationDate } from "../utils/date";
import { calculateNextReportDate } from "../utils/helper";
import { accessTokenSignOptions, RefreshTokenPayload, refreshTokenSignOptions, SignJwtToken, verifyJwtToken } from "../utils/jwt";
import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator";
import mongoose from 'mongoose';
import { OAuth2Client } from "google-auth-library";

export const registerService = async(body:RegisterSchemaType)=>{
    const {email} =  body;
    const session = await mongoose.startSession();

    try{
        const result = await session.withTransaction(async()=>{

            const existingUser = await  userModel.findOne({email:email}).session(session);
            if(existingUser){
                throw new  UnauthorizedException("User already exist with this email");
            };
        
            const newUser = new userModel({
                ...body,
                subscriptionPlan:"free",
                subscriptionStatus: "trialing",
                trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            });

            await newUser.save({session});

            const verificationCode = await VerificationCodeModel.create([{
                userId: newUser._id,
                type:VerificationEnum.EMAIL_VERIFICATION,
                expiredAt: new Date(Date.now() + 45 * 60 * 1000),
            }],{session});

            const code = verificationCode[0].code;

            const verificationUrl = `${Env.FRONTEND_ORIGIN}/confirm-account?code=${code}`;


            const reportSetting = new ReportSettingModel({
                userId:newUser._id,
                frequency:ReportFrequencyEnum.MONTHLY,
                isEnabled:true,
                lastSentDate:null,
                nextReportDate:calculateNextReportDate(),
            });

            await reportSetting.save({session});

            return {
                user:newUser,
                verificationUrl,
            }
            
        });

        //after transaction succeeds
       
        await sendEmail({
                to:result.user.email,
                ...verifyEmailTemplate(result.verificationUrl)
        });

        return {user:result.user.omitPassword()};

    }catch(error){
        throw error;

    }finally{
        await session.endSession();
    }




}

export const loginService = async(body:LoginSchemaType)=>{
        const {email,password,userAgent} =  body;

        const user = await userModel.findOne({email});

        if(!user){throw new NotFoundException("Email/Password not found")};

        // ── NEW: Google-only account trying to log in with password ──────────────
         if (!user.password) {
            throw new UnauthorizedException(
            "This account uses Google Sign-In. Please continue with Google."
            );
        }

        const isPasswordValid = await user.comparePassword(password);

        if(!isPasswordValid){throw new UnauthorizedException("Please provide the valid password")};

        const session = await SessionModel.create({
            userId:user.id,
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

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const RefreshService = async(refreshToken:string)=>{
    const {payload,error} = verifyJwtToken<RefreshTokenPayload>(refreshToken,{
      secret: refreshTokenSignOptions.secret,
    });

    if(!payload){
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await SessionModel.findById(payload.sessionId);
    const now = Date.now();

    if(!session){
      throw new UnauthorizedException("Session does not exist");
    }
    if(session.expiredAt.getTime() <= now){
      throw new UnauthorizedException("Session expired");

    }
    // If the session expires within 1 day, roll it forward
    const sessionRequireRefresh = session.expiredAt.getTime()- now <= ONE_DAY_IN_MS;
    if(sessionRequireRefresh){
      session.expiredAt = calculateExpirationDate(Env.JWT_REFRESH_EXPIRES_IN);
      await session.save();
    };
    const newRefreshToken = sessionRequireRefresh ? SignJwtToken(
        {sessionId: session._id.toString()} as any,
        refreshTokenSignOptions
    ):undefined;

    const user = await userModel.findById(session.userId);
    if (!user) throw new UnauthorizedException("User not found");

    const { token: accessToken, expiresAt } = SignJwtToken({ userId: user.id,sessionId:session._id.toString() });

    return {user:user.omitPassword(),accessToken,expiresAt,newRefreshToken};


};


export const logoutService = async(sessionId:string)=>{
    return await SessionModel.findByIdAndDelete(sessionId);
};


export const forgotPasswordService = async(email:string)=>{
    const user = await userModel.findOne({email:email});

    if(!user) throw new NotFoundException("User not found");

    //check the mail rate limit like sent 2 email per 3 or 10 min

    const timeAgo = new Date(Date.now() - 3 * 60 * 1000);
    const maxAttempts = 2;
    const count = await VerificationCodeModel.countDocuments({
        userId:user._id,
        type:VerificationEnum.PASSWORD_RESET,
        createdAt:{$gt:timeAgo},
    });

    if(count >= maxAttempts){
        throw new HttpException(
            "Too many request,try again later",
            HTTPSTATUS.TOO_MANY_REQUESTS,
        )
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const validCode = await VerificationCodeModel.create({
        userId:user._id,
        type:VerificationEnum.PASSWORD_RESET,
        expiredAt:expiresAt,

    });

     const resetLink = `${Env.FRONTEND_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

     const {data,error} = await sendEmail({
        to:user.email,
        ...passwordResetTemplate(resetLink),
     });

      if(!data?.id){
      throw new InternalServerException(`${error?.name}${error?.message}`)
    }

    return  {
      url:resetLink,
      emailId:data.id,
    }

};

interface resetPasswordDta{
    password:string;
    verificationCode:string;
}
export const resetPasswordService = async({password,verificationCode}:resetPasswordDta)=>{
    const validCode = await VerificationCodeModel.findOne({code:verificationCode,type:VerificationEnum.PASSWORD_RESET,expiredAt:{$gt:new Date()}});

    if(!validCode){
      throw new NotFoundException("Invalid or expired verification code");

    }

    const hashedPassword = await hashValue(password);
    const updateUser = await userModel.findByIdAndUpdate(validCode.userId,{password:hashedPassword});
    if(!updateUser){
      throw new BadRequestException("Failed to reset password");

    }


    await validCode.deleteOne();

    await SessionModel.deleteMany({
      userId:updateUser._id,
    });

    return{
      user:updateUser,
    };
}

export const verifyEmailService = async(code:string)=>{
    const validCode = await VerificationCodeModel.findOne({code:code,type:VerificationEnum.EMAIL_VERIFICATION,expiredAt:{$gt:Date.now()}});

    if(!validCode){
      throw new BadRequestException("Invalid or expired verifcation");
    };

    const updatedUser = userModel.findByIdAndUpdate(
        validCode.userId,
        {
            isEmailVerified:true
        },
        {new:true}//return the updated document instead of the original.
    );

    if(!updatedUser){
      throw new BadRequestException("Unable to verify email address");
    }

    await validCode.deleteOne();

    return {
      user:updatedUser,
    }


}



const googleClient = new OAuth2Client(Env.GOOGLE_CLIENT_ID);

interface GoogleAuthPayload {
    googleId:string;
    email:string;
    name:string;
    picture:string;
    emailVerified:boolean;
}

/**
 * Verifies the ID token Google sends to the frontend, then extracts the
 * user's profile from it. The frontend receives this token after the user
 * completes the Google consent screen.
 */

export const verifyGoogleToken = async(
    idToken:string
):Promise<GoogleAuthPayload>=>{
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience:Env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new UnauthorizedException("Invalid Google token");
    }

    return{
        googleId:payload.sub,
        email:payload.email,
        name:payload.name ?? payload.email.split("@")[0],
        picture:payload.picture ?? "",
        emailVerified:payload.email_verified ?? false,
    };
};

/**
 * Main Google sign-in / sign-up service.
 *
 * Four cases handled:
 *  1. New user  → create account, mark email verified, log them in.
 *  2. Existing Google user → find by googleId, log them in.
 *  3. Existing email/password user → link googleId, log them in.
 *  4. (Impossible here) Google token invalid → throws UnauthorizedException.
 */
export const googleAuthService = async(
    idToken:string,
    userAgent?:string
)=>{
    // ── Step 1: verify the token Google gave the frontend ──────────────────────
    const googlePayload = await verifyGoogleToken(idToken);

    const session = await mongoose.startSession();

    const result = await session.withTransaction(async()=>{
        // ── Step 2: look for an existing user ────────────────────────────────────

        // First try by googleId (fastest path — returning Google user)

        let user = await userModel.findOne({googleId:googlePayload.googleId}).session(session);
        if(!user){
            // Try by email — covers the "already has local account" case
            user = await userModel
                .findOne({ email: googlePayload.email })
                .session(session);
            if(user){
                  // ── Case 3: existing local account → link Google ──────────────────
                user.googleId = googlePayload.googleId;
                // Keep provider as "local" so they can still log in with password.
                // Just add googleId so Google login also works.
                if(!user.profilePicture && googlePayload.picture){
                    user.profilePicture = googlePayload.picture;
                }
                // Google confirmed email ownership
                user.isEmailVerified = true;
                await user.save({ session });
            }else{
                  // ── Case 1: brand-new user ────────────────────────────────────────
                const [newUser] = await userModel.create(
                    [
                        {
                            name:googlePayload.name,
                            email:googlePayload.email,
                            password:null,
                            profilePicture:googlePayload.picture,
                            googleId:googlePayload.googleId,
                            provider:"google",
                            isEmailVerified:true,
                            subscriptionPlan: "free",
                            subscriptionStatus: "trialing",
                            trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                        },
                    ],
                    {session}
                );

                // Create default report settings (same as registerService)
                 await ReportSettingModel.create(
                    [
                        {
                        userId: newUser._id,
                        frequency: ReportFrequencyEnum.MONTHLY,
                        isEnabled: true,
                        lastSentDate: null,
                        nextReportDate: calculateNextReportDate(),
                        },
                    ],
                    { session }
                );

                user = newUser;
            }
        }

         // ── Case 2: existing Google user — nothing to update, just fall through ──

        // ── Step 3: create session + tokens (same as loginService) ───────────────

        const dbSession = await SessionModel.create(
            [{userId:user._id,userAgent}],
            {session}
        );

        const {token:accessToken,expiresAt} = SignJwtToken(
            {userId:user.id,sessionId:dbSession[0]._id.toString()},
            accessTokenSignOptions
        );

        const {token:refreshToken} = SignJwtToken(
            {sessionId:dbSession[0]._id.toString()} as any,
            refreshTokenSignOptions
        );

        const reportSetting = await ReportSettingModel.findOne({userId:user._id},{_id:1,frequency:1,isEnabled:1}).lean().session(session);

        return {
            user: user.omitPassword(),
            accessToken,
            expiresAt,
            refreshToken,
            reportSetting,
        };
    });

    await session.endSession();
    return result;
}