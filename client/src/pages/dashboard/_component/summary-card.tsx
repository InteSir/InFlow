import { FC } from "react";
import CountUp from "react-countup";
import { TrendingDownIcon, TrendingUpIcon, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, FormatCurrencyOptions } from "@/lib/format-currency";
import { formatPercentage } from "@/lib/format-percentage";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DateRangeEnum, DateRangeType } from "@/components/date-range-select";

type CardType = "balance" | "income" | "expenses" | "savings";
type CardStatus = {
  label: string;
  color: string;
  Icon: LucideIcon;
  description?: string;
};
interface SummaryCardProps {
  title: string;
  value?: number;
  dateRange?: DateRangeType;
  percentageChange?: number;
  isPercentageValue?: boolean;
  isLoading?: boolean;
  expenseRatio?: number;
  cardType: CardType;

  fmt:(value:number,options?:Omit<FormatCurrencyOptions,"currency">) => string;
}
const getCardStatus = (
  value: number, 
  cardType: CardType,
  expenseRatio?: number
): CardStatus => {
 if (cardType === "savings") {
    if (value === 0) {
      return {
        label: "No Savings Record",
        color: "text-gray-400",
        Icon: TrendingDownIcon,
      };
    }

    // Check savings percentage first
    if (value < 10) {
      return {
        label: "Low Savings",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: `Only ${value.toFixed(1)}% saved`,
      };
    }

    if (value < 20) {
      return {
        label: "Moderate",
        color: "text-yellow-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio?.toFixed(0)}% spent`,
      };
    }

    // High savings → check if expense ratio is unusually high for warning
    if (expenseRatio && expenseRatio > 75) {
      return {
        label: "High Spend",
        color: "text-red-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio.toFixed(0)}% spent`,
      };
    }

    if (expenseRatio && expenseRatio > 60) {
      return {
        label: "Warning: High Spend",
        color: "text-orange-400",
        Icon: TrendingDownIcon,
        description: `${expenseRatio.toFixed(0)}% spent`,
      };
    }

    return {
      label: "Good Savings",
      color: "text-green-400",
      Icon: TrendingUpIcon,
    };
  }

  if (value === 0) {
    const typeLabel =
      cardType === "income"
        ? "Income"
        : cardType === "expenses"
          ? "Expenses"
          : "Balance";

    return {
      label: `No ${typeLabel}`,
      color: "text-gray-400",
      Icon: TrendingDownIcon,
      description: ``,
    };
  }

  // For balance card when negative
  if (cardType === "balance" && value < 0) {
    return {
      label: "Overdrawn",
      color: "text-red-400",
      Icon: TrendingDownIcon,
      description: "Balance is negative",
    };
  }

  return {
    label: "",
    color: "",
    Icon: TrendingDownIcon,
  };
};


const getTrendDirection = (value: number, cardType: CardType) => {
  if (cardType === "expenses") {
    // For expenses, lower is better
    return value <= 0 ? "positive" : "negative";
  }
  // For income and balance, higher is better
  return value >= 0 ? "positive" : "negative";
};

const Bone = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-md bg-white/20", className)} />
);

const cardAccent: Record<CardType, string> = {
  balance:  "border-l-4 border-l-blue-400/50",
  income:   "border-l-4 border-l-green-400/50",
  expenses: "border-l-4 border-l-red-400/50",
  savings:  "border-l-4 border-l-yellow-400/50",
};

const SummaryCard: FC<SummaryCardProps> = ({
  title,
  value = 0,
  dateRange,
  percentageChange,
  isPercentageValue,
  isLoading,
  expenseRatio,
  cardType = "balance",
  fmt,
}) => {
  const status = getCardStatus(value, cardType, expenseRatio);
  const showTrend =
    percentageChange !== undefined &&
    percentageChange !== null &&
    cardType !== "savings";

  const trendDirection =
    showTrend && percentageChange !== 0
      ? getTrendDirection(percentageChange, cardType)
      : null;

  if (isLoading) {
      return (
        <div className={cn("bg-white/5 rounded-2xl px-5 py-5", cardAccent[cardType])}>
          <Bone className="h-4 w-24 mb-5" />
          <Bone className="h-10 w-full mb-6" />
          <div className="flex items-center gap-2">
            <Bone className="h-3 w-12" />
            <Bone className="h-3 w-16" />
          </div>
        </div>
      );
    }



  // This was recently updated
    const formatCountupValue = (val: number): string => {
    if (isPercentageValue) return formatPercentage(val, { decimalPlaces: 1 });
    return fmt(val, {
      type: cardType === "expenses" ? "EXPENSE" : "INCOME",
      compact:"true",
      
    });
  };

  return (
   
        <div className={cn("bg-[var(--card)] rounded-2xl px-5 py-5  text-sm font-medium tracking-wide text-textMuted dark:bg-[#1E1E1E] shadow-[0_4px_20px_-2px_rgba(20,20,20,0.04),0_2px_6px_-1px_rgba(20,20,20,0.02)] border border-black/5")}>
          {/* Title */}
          <p className="text-sm lg:text-lg text-gray-900 font-medium mb-5 dark:text-gray-100 ">{title}</p>

          {/* AnimatedValue */}
          <div className={cn("text-lg lg:text-4xl font-bold mb-5 tracking-tight pl-5",cardType==="balance" && value < 0 ? 'text-red-400':"text-gray-900 dark:text-gray-100")}>
            <CountUp 
            start={0}
            end={value}
            preserveValue
            decimalPlaces={2}
            formattingFn={formatCountupValue} />
          </div>

          {/* Footer */}
      <div className="text-[0.6rem] text-gray-400 lg:text-sm">
 
        {cardType === "savings" ? (
          // Savings status label
          <div className="flex flex-col lg:flex-row items-center gap-1.5">
            <status.Icon className={cn("size-3.5 shrink-0", status.color)} />
            <span className={status.color}>
              {status.label}{value !== 0 && ` (${formatPercentage(value)})`}
            </span>
            {status.description && (
              <span className="text-gray-400 ml-1">• {status.description}</span>
            )}
          </div>
 
        ) : dateRange?.value === DateRangeEnum.ALL_TIME ? (
          // All-time range label
          <span>Showing {dateRange?.label}</span>
 
        ) : value === 0 || status.label ? (
          // Zero value or special status
          <div className="flex flex-col lg:flex-row  items-center gap-1.5">
            <status.Icon className={cn("size-3.5 shrink-0", status.color)} />
            <span className={status.color}>{status.label}</span>
            {status.description ? (
              <span className="text-gray-400 text-xs lg:text-sm">• {status.description}</span>
            ) : (
              <span className="text-gray-400">• {dateRange?.label}</span>
            )}
          </div>
 
        ) : showTrend ? (
          // Percentage trend vs previous period
          <div className="flex flex-col lg:flex-row items-center gap-1.5">
            {percentageChange !== 0 ? (
              <div
                className={cn(
                  "flex  items-center gap-0.5",
                  trendDirection === "positive" ? "text-green-500" : "text-red-500"
                )}
              >
                {trendDirection === "positive" ? (
                  <TrendingUpIcon className="size-3" />
                ) : (
                  <TrendingDownIcon className="size-3" />
                )}
                <span>
                  {formatPercentage(percentageChange || 0, {
                    showSign: percentageChange !== 0,
                    isExpense: cardType === "expenses",
                    decimalPlaces: 1,
                  })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 text-gray-400">
                <TrendingDownIcon className="size-3" />
                <span>{formatPercentage(0, { showSign: false, decimalPlaces: 1 })}</span>
              </div>
            )}
            <span className="text-gray-400">• {dateRange?.label}</span>
          </div>
 
        ) : null}
      </div>

        </div>

  );
};

export default SummaryCard;
