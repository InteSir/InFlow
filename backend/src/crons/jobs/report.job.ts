import { endOfMonth, startOfMonth, subMinutes, subMonths } from "date-fns";
import ReportSettingModel from "../../models/report-setting.model";
import { UserDocument } from "../../models/user.model";
import mongoose from "mongoose";
import { generateReportService, resolveDataRange, shouldSendReport } from "../../services/reports.service";
import ReportModel, { ReportStatusEnum } from "../../models/report.model";
import { calculateNextReportDate } from "../../utils/helper";
import { format } from "date-fns";
import { sendReportEmail } from "../../mailer/report.mailer";


/**
 * processReportJob
 * ─────────────────
 * Called every hour by the scheduler.
 *
 * For each enabled ReportSetting whose nextReportDate is in the past:
 *   1. Resolve the correct date range (LAST_7_DAYS / LAST_30_DAYS / LAST_MONTH / CUSTOM)
 *   2. Generate the report data
 *   3. Check user-defined conditions — skip the email if none are met
 *   4. Send the email
 *   5. In a single transaction: record the Report document + advance nextReportDate
 *
 * Hourly polling (vs a fixed monthly cron) means we catch DAILY and WEEKLY
 * users correctly without needing one cron per frequency.
 */

export const processReportJob = async() =>{
    const now  = new Date();
    let processedCount = 0;
    let failedCount = 0; 
    //if now is july 1st, then report => 1-30 june
    // const from = startOfMonth(subMonths(now,1));
    // const to  = endOfMonth(subMonths(now,1));

    try{
        const reportSettingCursor = ReportSettingModel.find({
            isEnabled:true,
            nextReportDate:{$lte:now},
        }).populate<{userId:UserDocument}>("userId")
          .cursor();

        console.log("▶ Running report job at", now.toISOString());
 

        for await (const setting of reportSettingCursor ){
            const user = setting.userId as UserDocument;
            if(!user) {
                console.log("user not found for setting")
                continue;

            }

            let from:Date;
            let to:Date;

            try{
                const range = resolveDataRange(
                    setting.reportPeriod,
                    setting.customFromDate,
                    setting.customToDate,
                );
                from=range.from;
                to=range.to;
            }catch(err){
                 console.error(`  ✗ Bad date range for user ${user.id}:`, err);
                 failedCount++;
                continue;
            }
            const session = await mongoose.startSession();

            try{
                const report = await generateReportService(user.id,from,to);

                console.log(`  ↳ user=${user.id} period=${from.toDateString()}→${to.toDateString()} report=${report ? "ok" : "no activity"}`);

                    // ── 3. Check conditions ──────────────────────────────────────────────
                // If the report exists but conditions say "don't send" we still
                // advance nextReportDate so we come back next cycle, but we record
                // the report as NO_ACTIVITY so the history table is honest.

                const conditionPassed = report && shouldSendReport(
                    {
                        minExpenses:setting.conditions?.minExpenses ?? null,
                        maxSavingsRate: setting.conditions?.maxSavingsRate ?? null,
                        detectUnusual:  setting.conditions?.detectUnusual  ?? false,
                    },
                    report._raw,
                    report.summary.topCategories
                )

                let emailSent = false;


                if(conditionPassed){
                    try{
                        await sendReportEmail({
                            email:user.email!,
                            username:user.name,
                             report: {
                                period: report!.period,
                                totalIncome: report!.summary.income,
                                totalExpenses: report!.summary.expenses,
                                availableBalance: report!.summary.balance,
                                savingsRate: report!.summary.savingsRate,
                                topSpendingCategories: report!.summary.topCategories,
                                insights:report!.insights,
                            },
                            frequency: setting.frequency!,
                        });

                        emailSent = true;

                    }catch(error){
                        console.log(`Email failed for ${user.id}`,error);

                    }
                }
                   // ── 5. Persist results in one transaction ────────────────────────────

                await session.withTransaction(async()=>{
                    const periodLabel = report?.period ?? `${format(from, "MMMM d")} - ${format(to, "d, yyyy")}`;
                    
                    //determine status
                    let status:ReportStatusEnum;
                    if(!report || !conditionPassed){
                        status = ReportStatusEnum.NO_ACTIVITY;

                    }else if (emailSent){
                        status = ReportStatusEnum.SENT;

                    }else{
                        
                        status = ReportStatusEnum.FAILED;
                    }

                    await Promise.all([
                        ReportModel.bulkWrite(
                            [
                                {
                                    insertOne:{
                                        document:{
                                            userId:user.id,
                                            sentDate:now,
                                            period:periodLabel,
                                            status,
                                            createdAt:now,
                                            updatedAt:now,

                                        }
                                    }
                                }
                            ],{
                                ordered:false
                            }
                        ),
                        ReportSettingModel.bulkWrite(
                                [
                                    {
                                        updateOne: {
                                        filter: { _id: setting._id },
                                        update: {
                                            $set: {
                                            // Only record lastSentDate when the email actually went out
                                            lastSentDate:    emailSent ? now : setting.lastSentDate,
                                            // Always advance so we don't re-fire this cycle
                                            nextReportDate:  calculateNextReportDate(now, setting.frequency),
                                            updatedAt: now,
                                            },
                                        },
                                        },
                                    },
                                ],
                                { ordered: false }
                            
                        ),
                        ]);
                },{
                    maxCommitTimeMS:10000, 
                });
                processedCount++;

            }catch(error){
                console.log(`Failed to process report ${user.id}:`,error);
                failedCount++;

            }finally{
                await session.endSession();
            }

        }
        console.log(`✔ Report job done — processed: ${processedCount}, failed: ${failedCount}`);

        return{
            success:true,
            processedCount,
            failedCount,
        };

    }catch(error){
        console.log(`Error processing reports`,error);
        return {
            success:false,
            error:"Report process failed"
        }

    }
};