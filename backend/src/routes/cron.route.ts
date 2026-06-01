import express, { Request, Response } from "express";
import { Env } from "../config/env.config";
import { processReportJob } from "../crons/jobs/report.job";
import { processRecurringTransactions } from "../crons/jobs/transaction.jobs";

const CronRouter = express.Router();

// Middleware to verify Vercel's secret handshake token
const verifyCronSecret = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${Env.CRON_SECRET}`) {
    console.warn(`[CRON WARNING] Unauthorized attempt blocked from IP: ${req.ip}`);
    return res.status(401).json({ error: "Unauthorized: Missing or invalid secret key" });
  }
  next();
};

/**
 * POST /api/cron/trigger
 * Triggers both recurring payments and reporting schedules
 */
CronRouter.post("/trigger", verifyCronSecret, async (req: Request, res: Response) => {
  console.log("⏱️ Cron route triggered by Vercel scheduler...");
  
  try {
    // 1. Process pending recurring transactions
    console.log("-> Processing recurring transactions...");
    const txResult = await processRecurringTransactions();

    // 2. Process reports (checks for users whose nextReportDate has passed)
    console.log("-> Processing report distribution...");
    const reportResult = await processReportJob();

    return res.status(200).json({
      message: "Cron jobs processed successfully",
      transactions: txResult,
      reports: reportResult
    });
  } catch (error: any) {
    console.error("❌ Cron route execution failed:", error);
    return res.status(500).json({ error: error.message || "Execution failed" });
  }
});

export default CronRouter;