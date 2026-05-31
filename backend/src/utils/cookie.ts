import { CookieOptions,Response } from "express";
import { Env } from "../config/env.config";
import { calculateExpirationDate } from "./date";




// export const REFRESH_PATH = `${Env.BASE_PATH}/auth/refresh`;

const defaults:CookieOptions = {
    httpOnly:true,
    secure:Env.NODE_ENV === "production",
    sameSite:Env.NODE_ENV === "production" ? "none" : "lax",
};

export const getRefreshTokenCookieOptions = ():CookieOptions => {
    const expires = calculateExpirationDate(Env.JWT_REFRESH_EXPIRES_IN);
    return {
        ...defaults,
        expires,
        path:"/",
    };
};

export const setRefreshTokenCookie = (res:Response,refreshToken:string):Response => res.cookie("refreshToken",refreshToken,getRefreshTokenCookieOptions());

export const clearAuthenticationCookies = (res:Response):Response => 
    res.clearCookie("refreshToken",{...defaults,path:"/"});