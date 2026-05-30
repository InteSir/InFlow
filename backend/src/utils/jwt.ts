import jwt,{ JwtPayload, SignOptions,VerifyOptions } from "jsonwebtoken";
import { Env } from "../config/env.config";

type TimeUnit = "s" | "m"| "h" | "d" | "w" | "y";
type TimeString = `${number}${TimeUnit}`;

export type AccessTokenPayload = {
    userId: string;
    sessionId:string;
};

export type RefreshTokenPayload = {
    sessionId:string;
};

type SignOptsAndSecret = SignOptions & {
    secret:string;
    expiresIn?:TimeString | number;
};

const defaults: SignOptions = {
    audience:["user"]
};

export const accessTokenSignOptions: SignOptsAndSecret = {
    expiresIn:Env.JWT_EXPIRES_IN as TimeString,
    secret:Env.JWT_SECRET,

};

export const refreshTokenSignOptions:SignOptsAndSecret = {
    expiresIn:Env.JWT_REFRESH_EXPIRES_IN as TimeString,
    secret:Env.JWT_REFRESH_SECRET,
}

export const SignJwtToken = (payload:AccessTokenPayload | RefreshTokenPayload,options?:SignOptsAndSecret) =>{
    const isAccessToken = !options || options === accessTokenSignOptions;

    const {secret,...opts} = options || accessTokenSignOptions;
    const token = jwt.sign(payload,secret,{...defaults,...opts});   //jwt.sign(payload,secret,{ audience:["user"],expiresIn:Env.JWT_EXPIRES_IN});

    const expiresAt = isAccessToken ? (jwt.decode(token) as JwtPayload)?.exp!*1000 : undefined; //covert sec to milli seconds as js uses Date.now as milliseconds

    return {
        token,
        expiresAt
    };



};

export const verifyJwtToken = <TPayload extends object = AccessTokenPayload>(
    token:string,
    options ?: VerifyOptions & {secret:string} 
)=>{
    try{

        const {secret=Env.JWT_SECRET,...opts} = options || {};
        const payload = jwt.verify(token,secret,{
            audience: ['user'],
            ...opts,
        }) as TPayload;
        return {payload};
    }catch(err:any){
        return {error: err.message,}
    }


};


