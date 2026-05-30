
import {addDays, addMonths, addWeeks, addYears, startOfDay, startOfMonth } from "date-fns"
import { RecurringIntervalEnum } from "../models/transaction.model";
import { ReportFrequencyEnum } from "../models/report-setting.model";


export function calculateNextReportDate(
    referenceDate?:Date | null | undefined,
    frequency:keyof typeof ReportFrequencyEnum = ReportFrequencyEnum.MONTHLY
    ):Date{
   
    
    // If there is no reference--(The date from which we calculate the NEXT schedule.) (first-time setup) use today
    const base  = referenceDate ? startOfDay(new Date(referenceDate)) : startOfDay(new Date());

    switch (frequency){
        case ReportFrequencyEnum.DAILY:
      return addDays(base, 1);
    case ReportFrequencyEnum.WEEKLY:
      return addWeeks(base, 1);
    case ReportFrequencyEnum.MONTHLY:
    default:
      return addMonths(base, 1);
  }

}




export function calculateNextOccurrence(date:Date,recurringInterval:keyof typeof RecurringIntervalEnum){
    const base = new Date(date)
    
    switch (recurringInterval){
        case RecurringIntervalEnum.DAILY:
            return addDays(base,1);
        case RecurringIntervalEnum.WEEKLY:
            return addWeeks(base,1);
        case RecurringIntervalEnum.MONTHLY:
            return addMonths(base,1);
        case RecurringIntervalEnum.YEARLY:
            return addYears(base,1);
        default:
            return base;

    
}
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}