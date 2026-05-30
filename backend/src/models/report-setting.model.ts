import mongoose from "mongoose";

export enum ReportFrequencyEnum {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}
// What date range to use when building the report
export enum ReportPeriodEnum {
  LAST_7_DAYS = "LAST_7_DAYS",   // rolling 7 days before today
  LAST_30_DAYS = "LAST_30_DAYS", // rolling 30 days before today
  LAST_MONTH = "LAST_MONTH",     // calendar month e.g. all of June
  CUSTOM = "CUSTOM",             // user picks fromDate / toDate manually
}

// ─── Conditions sub-document ──────────────────────────────────────────────────
// The report is only sent when at least one active condition is met.
// If no conditions are enabled we always send (default behaviour).
export interface ReportConditions {
  // Only send when total expenses exceed this dollar amount (null = disabled)
  minExpenses: number | null;
  // Only send when savings rate drops below this % (null = disabled)
  maxSavingsRate: number | null;
  // Only send when a category spends >50 % more than its 3-period average
  detectUnusual: boolean;
}

export interface ReportSettingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  frequency: keyof typeof ReportFrequencyEnum;
  reportPeriod:keyof typeof ReportPeriodEnum;
  //only used when reportPeriod === Custome
  customFromDate?:Date;
  customToDate?:Date;

  isEnabled: boolean;
  nextReportDate?: Date;
  lastSentDate?: Date;

  conditions:ReportConditions;
  createdAt: Date;
  updatedAt: Date;
}

const reportSettingSchema = new mongoose.Schema<ReportSettingDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    frequency: {
      type: String,
      enum: Object.values(ReportFrequencyEnum),
      default: ReportFrequencyEnum.MONTHLY,
    },
    reportPeriod: {
      type: String,
      enum: Object.values(ReportPeriodEnum),
      default: ReportPeriodEnum.LAST_MONTH,
    },
        // Stored only when reportPeriod === CUSTOM
    customFromDate: { type: Date },
    customToDate: { type: Date },

    isEnabled: {
      type: Boolean,
      default: false,
    },
    nextReportDate: {
      type: Date,
    },
    lastSentDate: {
      type: Date,
    },
    // Conditions that gate whether the email is actually sent
    conditions: {
      minExpenses:    { type: Number, default: null }, // e.g. 500 → only send if expenses > $500
      maxSavingsRate: { type: Number, default: null }, // e.g. 10  → only send if savings < 10 %
      detectUnusual:  { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const ReportSettingModel = mongoose.model<ReportSettingDocument>(
  "ReportSetting",
  reportSettingSchema
);

export default ReportSettingModel;