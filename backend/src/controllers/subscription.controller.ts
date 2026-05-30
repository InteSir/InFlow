import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHanlder.middleware";
import { Request,Response } from "express";
import { createBillingPortalSession, createCheckoutSession, handleStripeWebhook } from "../services/subscription.service";
import userModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";

export const createCheckoutController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id.toString();
    const interval = req.body.interval === "yearly" ? "yearly" : "monthly";

    const result = await createCheckoutSession(userId,interval);
    return res.status(HTTPSTATUS.OK).json({
            message:"Checkout successfully",
            data:result,
    });


});


export const createBillingPortalController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id.toString();
    const result = await createBillingPortalSession(userId);
    return res.status(HTTPSTATUS.OK).json({
            message:"created billing portal successfully",
            data:result,
    });


});


export const getStatus = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id.toString();
    const user = await userModel.findById(userId);

    if(!user) throw new NotFoundException("User not found");


    res.status(HTTPSTATUS.OK).json({
        plan:            user.subscriptionPlan,
        status:          user.subscriptionStatus,
        trialEndsAt:     user.trialEndsAt,
        currentPeriodEnd: user.currentPeriodEnd,
        hasAccess:       user.hasProAccess(),
    });


});

export const handleStripeWebhookController = asyncHandler(async(req:Request,res:Response)=>{
    const signature = req.headers["stripe-signature"] as string;
    const result = await handleStripeWebhook(req.body, signature);
    res.status(HTTPSTATUS.OK).json(result);
});




