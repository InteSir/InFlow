import {
    Strategy as JwtStrategy,
    ExtractJwt,
    StrategyOptions,
}from "passport-jwt";
import passport from "passport";
import { Env } from "./env.config";
import { findByIdUserService } from "../services/user.service";


interface JwtPayload {
    userId:string;
    sessionId:string;
}

const options:StrategyOptions= {
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:Env.JWT_SECRET,
    audience:["user"],
    algorithms:["HS256"],
    passReqToCallback:true,
}

passport.use(new JwtStrategy(options,async(req,payload:JwtPayload,done)=>{
    try{
        if(!payload.userId){
            return done(null,false,{message:"Invalid token payload"});
        }
        const user = await findByIdUserService(payload.userId);
        if(!user){
            return done(null,false);

        }
        req.sessionId = payload.sessionId;
        return done(null,user);

    }catch(error){
        return done(error,false);

    }

}));

passport.serializeUser((user:any,done)=>done(null,user));
passport.deserializeUser((user:any,done)=>done(null,user));

export const passportAuthenticateJwt = passport.authenticate("jwt",{
    session:false,
});


