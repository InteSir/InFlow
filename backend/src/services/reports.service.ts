import mongoose from "mongoose";
import ReportSettingModel, { ReportFrequencyEnum, ReportPeriodEnum } from "../models/report-setting.model";
import ReportModel from "../models/report.model";
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model";
import { NotFoundException } from "../utils/app-error";
import { calculateNextReportDate } from "../utils/helper";
import { UpdateReportSettingType } from "../validators/report.validator";
import { convertToDollarUnit } from "../utils/format-currency";
import { endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns';
import { reportInsightPrompt } from "../utils/prompt";
import { createUserContent } from "@google/genai";
import { genAi, genAiModel } from "../config/google-ai.config";


export const getAllReportsService = async(
    userId:string,
    pagination:{
        pageSize:number;
        pageNumber:number;
    }
)=>{
    const query: Record<string,any> = {userId};
    const {pageSize,pageNumber} = pagination;
    const skip = (pageNumber - 1) * pageSize; //MongoDB doesn’t understand "page 2" It understands:👉 “Skip (page1*pageSize) records, then give me next page2 records”

    const [reportsall,totalCount] = await Promise.all([
        ReportModel.find(query).skip(skip).limit(pageSize).sort({createdAt:-1}),
        ReportModel.countDocuments(query),

    ]);
    const reportSettings = await ReportSettingModel.findOne({userId}).select("frequency");
    const totalPages = Math.ceil(totalCount/pageSize);

    const reports = reportsall.map((report) => ({
        ...report.toObject(),
        frequency: reportSettings?.frequency || null,
     
    }));
 console.log(reports);
    return{
        reports,
        pagination:{
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    }
};

export const updateReportSettingService = async( userId:string,body:UpdateReportSettingType)=>{
    const {isEnabled,frequency,reportPeriod,customFromDate,customToDate,conditions} = body;

    let nextReportDate:Date | null = null;

    const existingReportSetting = await ReportSettingModel.findOne({userId,});

    if(!existingReportSetting) throw new NotFoundException("Report Setting not found");



    if(isEnabled){
        const now = new Date();
        const freq = frequency ?? existingReportSetting.frequency ?? ReportFrequencyEnum.MONTHLY;
    
        const currentNextReportDate = existingReportSetting.nextReportDate;


        if(!currentNextReportDate || currentNextReportDate <= now){
            nextReportDate = calculateNextReportDate(existingReportSetting.lastSentDate,freq);
        }else{
             // There is already a future date — keep it unless frequency changed
            const freqChanged = frequency && frequency !== existingReportSetting.frequency;
            nextReportDate = freqChanged
                ? calculateNextReportDate(existingReportSetting.lastSentDate, freq)
                : currentNextReportDate;

        }

    }

    existingReportSetting.set({
        isEnabled,
        ...(frequency && {frequency}),
        ...(reportPeriod  && { reportPeriod }),
        ...(customFromDate !== undefined && { customFromDate: customFromDate ? new Date(customFromDate) : null }),
        ...(customToDate   !== undefined && { customToDate:   customToDate   ? new Date(customToDate)   : null }),
        ...(conditions     && {
                    conditions: {
                        ...existingReportSetting.conditions,   // keep any fields not sent
                        ...conditions,
      },
    }),
    nextReportDate,

    });

    await existingReportSetting.save();

};
// ─── resolveDateRange ─────────────────────────────────────────────────────────
/**
 * Convert a ReportPeriod enum value into concrete { from, to } dates.
 * This is used by both the cron job and the manual "generate" endpoint.
 *
 * LAST_7_DAYS  → today-7 .. yesterday
 * LAST_30_DAYS → today-30 .. yesterday
 * LAST_MONTH   → 1st .. last day of previous calendar month
 * CUSTOM       → whatever the user stored
 */
export function resolveDataRange(
    period:keyof typeof ReportPeriodEnum,
    customFrom?:Date,
    customTo?:Date,
):{from:Date;to:Date}{
    const now = new Date();
    switch(period){
        case ReportPeriodEnum.LAST_7_DAYS:
            return {from:subDays(now,7),to:subDays(now,1)};
        case ReportPeriodEnum.LAST_30_DAYS:
            return {from:subDays(now,30),to:subDays(now,1)};
        case ReportPeriodEnum.CUSTOM:
            if(!customFrom || !customTo){
                throw new Error("CustomFromDate and CustomTODate are required for custom period");
            }
            return {from:customFrom,to:customTo};
        case ReportPeriodEnum.LAST_MONTH:
            const lastMonth = subMonths(now, 1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        default: {
        const lastMonth = subMonths(now, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        }

    }
}





export const generateReportService = async(userId:string,fromDate:Date,toDate:Date)=>{
    // Single aggregation with $facet so we do one DB round-trip for both
    // the summary totals and the top-5 expense categories
    const results = await TransactionModel.aggregate([
        {
            $match:{
                userId:new mongoose.Types.ObjectId(userId),
                date:{$gte:fromDate,$lte:toDate},
            },
        },

        {
            $facet:{
                summary:[
                    {
                        $group:{
                            _id:null,
                            totalIncome:{
                                $sum:{
                                    $cond:[
                                        {$eq:["$type",TransactionTypeEnum.INCOME]},
                                        {$abs:"$amount"},
                                        0,
                                    ],
                                },
                            },
                            totalExpenses:{
                                $sum:{
                                    $cond:[
                                        {$eq:["$type",TransactionTypeEnum.EXPENSE]},
                                        {$abs:"$amount"},
                                        0,
                                    ],
                                },
                            },
                        }
                    }
                ],
                categories:[
                    {
                        $match:{type:TransactionTypeEnum.EXPENSE},

                    },
                    {
                        $group:{
                            _id:"$category",
                            total: {$sum: {$abs:"$amount"} },
                        },
                    },
                    {
                        $sort:{total:-1},
                    },
                    {
                        $limit:5,
                    },

                ],
            }
        },
        {
            $project:{
                totalIncome:{$arrayElemAt:["$summary.totalIncome",0]},
                totalExpenses:{$arrayElemAt:["$summary.totalExpenses",0]},
                categories:1,
            }
        }
    ]);

    if(!results?.length || (results[0]?.totalIncome === 0 && results[0]?.totalExpenses === 0) ) return null;

    const {totalIncome = 0,totalExpenses = 0,categories = [],} = results[0] || {};

    
    const byCategory = categories.reduce((acc:any,{_id,total}:any)=>{
        acc[_id] = {
            amount:convertToDollarUnit(total),
            percentage:totalExpenses>0 ? Math.round((total/totalExpenses) * 100) : 0,
        };
        return acc;
    },{} as Record<string,{amount:number;percentage:number}>);

    const availableBalance = totalIncome - totalExpenses;
    const savingRate = calculateSavingRate(totalIncome,totalExpenses);

    const periodLabel = `${format(fromDate,"MMMM d,yyyy")} - ${format(toDate,"MMMM d, yyyy")}`;

    const insights = await generateInsightsAI({
        totalIncome,
        totalExpenses,
        availableBalance,
        savingsRate:savingRate,
        categories:byCategory,
        periodLabel:periodLabel,
    });

    console.log(insights);
    
    return{
        period:periodLabel,
        summary:{
            income:convertToDollarUnit(totalIncome),
            expenses:convertToDollarUnit(totalExpenses),
            balance:convertToDollarUnit(availableBalance),
            savingsRate:Number(savingRate.toFixed(1)),
            topCategories:Object.entries(byCategory)?.map(([name,cat]:any)=>({
                name,
                amount:cat.amount,
                percent:cat.percentage,
            })),
        },
        insights,
        _raw:{totalIncome,totalExpenses,savingRate},
    };




};

// ─── shouldSendReport ─────────────────────────────────────────────────────────
/**
 * Decides whether to actually send the email based on user-defined conditions.
 *
 * Rules (OR logic — any one condition being true triggers the send):
 *   • minExpenses    → expenses > threshold
 *   • maxSavingsRate → savingsRate < threshold
 *   • detectUnusual  → a category spent >50% more than its rolling 3-period average
 *                       (simplified here: any single category > 60% of total expenses)
 *
 * If NO condition is enabled we always send (return true).
 */
async function generateInsightsAI({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) {
  try {
    const prompt = reportInsightPrompt({
      totalIncome: convertToDollarUnit(totalIncome),
      totalExpenses: convertToDollarUnit(totalExpenses),
      availableBalance: convertToDollarUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      categories,
      periodLabel,
    });

    const result = await genAi.models.generateContent({
      model: genAiModel,
      contents: [prompt],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    });

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) return [];

    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    return [];
  }
};

export function shouldSendReport(
    conditions:{minExpenses:number | null; maxSavingsRate:number | null;detectUnusual:boolean},
    raw:{totalIncome:number,totalExpenses:number,savingRate:number},
    topCategories: { name: string; percent: number }[]
):boolean{
     const { minExpenses, maxSavingsRate, detectUnusual } = conditions;
     const noConditionsSet = minExpenses === null && maxSavingsRate === null && !detectUnusual;
     if (noConditionsSet) return true;

    if (minExpenses !== null && raw.totalExpenses > minExpenses) return true;
    if (maxSavingsRate !== null && raw.savingRate < maxSavingsRate) return true;
    if (detectUnusual && topCategories.some((c) => c.percent > 60)) return true;

    return false;
}

function calculateSavingRate(totalIncome:number,totalExpenses:number){
    if(totalIncome<=0) return 0;
    const savingRate = (totalIncome - totalExpenses)/totalIncome * 100;

    return parseFloat(savingRate.toFixed(2));
}