import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHanlder.middleware";
import { Request,Response } from "express";
import { generateReportService, getAllReportsService, updateReportSettingService } from "../services/reports.service";
import { updateReportSettingSchema } from "../validators/report.validator";


export const getAllReportsController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;

    console.log(userId);
    

    const pagination = {
        pageSize:parseInt(req.query.pageSize as string) || 20,
        pageNumber:parseInt(req.query.pageNumber as string) || 1,
    };
    const results = await getAllReportsService(userId,pagination);
    return res.status(HTTPSTATUS.OK).json({
        message:"Reports fetched successfully",
        ...results,
    });
});



export const updateReportSettingController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await  updateReportSettingService(userId,body);

    return res.status(HTTPSTATUS.OK).json({
        message:"Report setting updated successfully",
        
    });
});


export const generateReportController = asyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?._id;
    const {from,to} = req.query;
    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);



    const results = await  generateReportService(userId,fromDate,toDate);

    return res.status(HTTPSTATUS.OK).json({
        message:"Report generated successfully",
        ...results,
        
    });
});

