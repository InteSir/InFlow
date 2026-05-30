
import { Loader, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {useAppDispatch, useTypedSelector } from "@/app/hook";
import { useUpdateReportSettingMutation } from "@/features/report/reportAPI";
import { updateCredentials } from "@/features/auth/authSlice";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator"


 
// ─── types ────────────────────────────────────────────────────────────────────
type Frequency  = "DAILY" | "WEEKLY" | "MONTHLY";
type Period     = "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_MONTH" | "CUSTOM";

interface FormState {
  isEnabled:      boolean;
  frequency:      Frequency;
  reportPeriod:   Period;
  customFromDate: string; // ISO date string from <input type="date">
  customToDate:   string;
  minExpenses:    string; // stored as string so the input stays controlled
  maxSavingsRate: string;
  detectUnusual:  boolean;
}


// ─── helpers ──────────────────────────────────────────────────────────────────
 
/** Returns a plain-English description of when the next report fires */
function buildSummary(f:FormState):string{
  if(!f.isEnabled) return "Reports are currently deactivated.";

  const freqLabel: Record<Frequency, string> = {
    DAILY:   "every day",
    WEEKLY:  "every week",
    MONTHLY: "every month",
  };

  const periodLabel: Record<Period,string> = {
    LAST_7_DAYS:  "the last 7 days",
    LAST_30_DAYS: "the last 30 days",
    LAST_MONTH:   "the previous calendar month",
    CUSTOM:
      f.customFromDate && f.customToDate
        ? `${f.customFromDate} → ${f.customToDate}`
        : "a custom date range (please fill in the dates)",
  };

  const conditionParts: string[] = [];

  if (f.minExpenses)    conditionParts.push(`expenses > $${f.minExpenses}`);
  if (f.maxSavingsRate) conditionParts.push(`savings rate < ${f.maxSavingsRate}%`);
  if (f.detectUnusual)  conditionParts.push("unusual spending detected");

   const conditionText =
    conditionParts.length > 0
      ? ` — only when: ${conditionParts.join(" or ")}`
      : "";
 
  return `A report covering ${periodLabel[f.reportPeriod]} will be sent ${freqLabel[f.frequency]}${conditionText}.`;

}

const formSchema = z.object({
  email: z.string(),
  frequency: z.string(),
  isEnabled: z.boolean(),
  reportPeriod:z.string(),
  customFromDate:z.string(),
  customToDate:z.string(),
  minExpenses:z.string(),
  maxSavingsRate:z.string(),
  detectUnusual:z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;




export default function ReportSettings(){
      const dispatch = useAppDispatch();
      const {user,reportSetting} = useTypedSelector((state) => state. auth);
      const [updateReportSetting,{isLoading}] = useUpdateReportSettingMutation();
    
      
      // Initialize the form
      const {register,handleSubmit,formState:{errors},watch,setValue} = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: user?.email || "",
          isEnabled: reportSetting?.isEnabled || true,
          frequency:  reportSetting?.frequency || "MONTHLY",
          reportPeriod:reportSetting?.reportPeriod || "LAST_MONTH",
          customFromDate:reportSetting?.customFromDate ? new Date(reportSetting.customFromDate).toISOString().split("T")[0]  : "",
          customToDate:reportSetting?.customToDate ? new Date(reportSetting.customToDate).toISOString().split("T")[0]: "",
          minExpenses:    String(reportSetting?.conditions?.minExpenses    ?? ""),
          maxSavingsRate: String(reportSetting?.conditions?.maxSavingsRate ?? ""),
          detectUnusual:  reportSetting?.conditions?.detectUnusual ?? false,
        },
      });
    
      const isEnabled = watch("isEnabled");
      const reportPeriod = watch("reportPeriod");
      
      // Handle form submission
      const onSubmit = (values: FormValues) => {
    
        const payload = {
          isEnabled:      values.isEnabled,
          frequency:      values.frequency,
          reportPeriod:   values.reportPeriod,
          customFromDate: values.reportPeriod === "CUSTOM" && values.customFromDate
            ? new Date(values.customFromDate).toISOString()
            : null,
          customToDate: values.reportPeriod === "CUSTOM" && values.customToDate
            ? new Date(values.customToDate).toISOString()
            : null,
          conditions: {
            minExpenses:    values.minExpenses    ? parseFloat(values.minExpenses)    : null,
            maxSavingsRate: values.maxSavingsRate ? parseFloat(values.maxSavingsRate) : null,
            detectUnusual:  values.detectUnusual,
          },
        };
        console.log("Form submitted:", payload);
    
    
    
        updateReportSetting(payload).unwrap().then(() => {
          dispatch(updateCredentials({reportSetting: payload}))
    
          toast.success("Report setting updated successfully");
        }).catch((error) => {
          toast.error(error.data.message || "Failed to update report setting");
        })
    
      };
    
      const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
      const inputCls =    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm " +
        "focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 " +
        "dark:bg-[#121212] dark:border-gray-600 dark:text-white";
    return(
         <div className="via-root to-root rounded-xl bg-gradient-to-r p-0.5 py-2 border-b pb-5 max-w-[40rem] ">
            <div className="mb-5">
                <h3 className="text-lg font-medium"> Report Settings</h3>
                <p className="text-sm text-muted-foreground">
               Enable or disable monthly financial report emails
                </p>
            </div>
            <Separator />
            <div className="mt-5 ">
                <form onSubmit={handleSubmit(onSubmit)}>
                {/* EnableToggle */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700 mb-8 ">
                    <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Scheduled Reports</p>
                    <p className="text-xs text-gray-500 mt-0.5">{isEnabled ? "Reports activated" : "Reports deactivated"}</p>
                    </div>
        
                    <button type="button" role="switch" aria-checked={isEnabled} onClick={()=>setValue("isEnabled",!watch("isEnabled"))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}>
                    <span  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                        ${isEnabled ? "translate-x-6" : "translate-x-1"}`} >
            
                    </span>
                    </button>
                </div>
                {/* ── Fields — dimmed when disabled ───────────────────────────────── */}
                <div className={`space-y-6 transition-opacity  ${isEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                    <div className="space-y-4">
                    <label className={labelCls}>Email</label>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-gray-600"/>
                        <input type="email" disabled value={user?.email ?? ""} className={inputCls}></input>
                    </div>
                    </div>


                    <div className="grid grid-cols-2 gap-3">
                                            {/* Frequency */}
                    <div className="space-y-4">
                    <label className={labelCls}>Frequency</label>
                    <select
                        {...register("frequency")}
                        
                        className={inputCls}
                    >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                    </select>
                    </div>
        
        
        
                    {/* Report period */}
                    <div className="space-y-4">
                    <label className={labelCls}>Report Period</label>
                    <select
                        {...register("reportPeriod")}
                        
                        className={inputCls}
                    >
                        <option value="LAST_7_DAYS">Last 7 days</option>
                        <option value="LAST_30_DAYS">Last 30 days</option>
                        <option value="LAST_MONTH">Last calendar month</option>
                        <option value="CUSTOM">Custom date range</option>
                    </select>
                    </div>

                    </div>
        

        
                    {reportPeriod === "CUSTOM" && (
                    <div className="grid grid-cols-2 gap-3">
                            <div>
                            <label className={labelCls}>From</label>
                            <input type="date" {...register("customFromDate")} className={inputCls} onClick={(e) => e.target.showPicker()} />
                        </div>
        
                        <div>
                            <label className={labelCls}>To</label>
                            <input type="date" {...register("customToDate")} className={inputCls}  max={new Date().toISOString().split("T")[0]} onClick={(e) => e.target.showPicker()} />   
                        </div>
                    </div>
                    )}
        
                    {/* ── Send conditions ───────────────────────────────────────────── */}
                    <div>
                        <p  className={labelCls}> Send Conditions</p>
                        <p className="text-xs text-gray-500 mb-3">
                        (optional) Leave blank to always send. (— OR logic) If any one condition is met the report fires.
                    </p>
        
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
            
                            <label className="text-sm text-gray-600 dark:text-gray-400 w-48 shrink-0">Only if expenses exceed</label>
                            <div>
                            <span>
                                <input type="number" min="0" placeholder="e.g. 500" {...register("minExpenses")} className={`${inputCls} pl-6`}/>
                            </span>
                            </div>
            
                        </div>
        
                        {/* maxSavingsRate */}
                        <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 dark:text-gray-400 w-48 shrink-0">
                            Only if savings rate below
                        </label>
                        <div className="relative flex-1">
                            <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g. 10"
                            {...register("maxSavingsRate")}
                            
                            className={`${inputCls} pr-7`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                        </div>
                        </div>
            
                        {/* detectUnusual */}
                        <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            {...register("detectUnusual")}
                            className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Detect unusual spending (any category &gt; 60% of total)
                        </span>
                        </label>
        
        
                    </div>
                    </div>
        
                    {/* ── Schedule summary ──────────────────────────────────────────── */}
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                        Summary
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {buildSummary(watch() as FormState)}
                    </p>
                    </div>
                </div>
                {/* ── Save button — sticky at bottom ───────────────────────────────── */}
                <div className=" bottom-0 left-0 right-0 max-w-md mx-auto mt-2 px-5 py-3 bg-white dark:bg-transparent border-t border-gray-100 dark:border-gray-800 z-50 ">
                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-primary
                        py-2.5 text-sm font-medium text-white hover:bg-primary/90 
                        disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-[#C6FF34]/90 dark:text-black "
                    >
                    {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                    Save changes
                    </button>
                </div>
        
        
                </form>
            </div>

        </div>
    )
}