import cron, { schedule } from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.jobs";
import { processReportJob } from "./jobs/report.job";

const scheduleJob = (name:string,time:string,job:Function) =>{
    console.log(`Scheduling ${name} at ${time}`);

    return cron.schedule(time,
        
        async()=>{
            console.log(`[${new Date().toISOString()}] ▶ ${name} starting`);
            try{
                await job();
                console.log(`${name} completed`);
            }catch(error){
                console.log(`${name} failed`,error);

            }
    },{
           scheduled:true,
           timezone:"UTC",
    }
);
};

export const startJobs = () =>{
    return[
        // at 12.05am
        scheduleJob('Transactions','5 0 * * *',processRecurringTransactions),

            /**
     * Report job — every hour at :00
     *
     * Why hourly instead of a fixed monthly cron?
     * ──────────────────────────────────────────────
     * Users can now choose DAILY / WEEKLY / MONTHLY frequency.
     * The job itself checks each user's `nextReportDate` field and only
     * processes settings whose date has passed — so running it every hour
     * is cheap (most users are skipped) but guarantees we catch daily users
     * within 1 hour of their scheduled time, weekly within 1 hour, etc.
     *
     * Alternative: if you want to be precise to the minute you could run
     * every 5 minutes ("* /5 * * * *") but hourly is fine for reports.
     */
        scheduleJob("Report","0 * * * *",processReportJob),//run 2:30 am every first of the month
      

    ];
}