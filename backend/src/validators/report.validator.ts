import {z} from "zod";
import { ReportFrequencyEnum, ReportPeriodEnum } from "../models/report-setting.model";


// export const reportSettingSchema = z.object({
//     isEnabled:z.boolean().default(true),
// })
// export const updateReportSettingSchema = reportSettingSchema.partial();

export const updateReportSettingSchema = z.object({
    isEnabled:z.boolean(),
    frequency:z.nativeEnum(ReportFrequencyEnum).optional(),
    reportPeriod:z.nativeEnum(ReportPeriodEnum).optional(),

    customFromDate:z.string().datetime({offset:true}).optional().nullable(),
    customToDate:z.string().datetime({offset:true}).optional().nullable(),

    conditions:z.object({
        minExpenses:z.number().min(0).nullable().optional(),
        maxSavingsRate:z.number().min(0).max(100).nullable().optional(),
        detectUnusual:z.boolean().optional(),
    }).optional(),

}).refine(
    (data)=>{
        if (data.reportPeriod === ReportPeriodEnum.CUSTOM) {
            return !!data.customFromDate && !!data.customToDate;
      }
      return true;
    },
     {
      message:
        "customFromDate and customToDate are required when reportPeriod is CUSTOM",
      path: ["customFromDate"],
    }

)
export type UpdateReportSettingType = z.infer<typeof updateReportSettingSchema>;