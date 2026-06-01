import { useSummaryAnalyticsQuery } from "@/features/analytics/analyticsAPI";
import SummaryCard from "./summary-card";
import { DateRangeType } from "@/components/date-range-select";
import useCurrency from "@/hooks/use-currency";

const DashboardStats = ({ dateRange }: { dateRange?: DateRangeType }) => {

  const { data} = useSummaryAnalyticsQuery(
    { preset: dateRange?.value },
    { skip: !dateRange }
  );
  const{fmt} = useCurrency();
  

  const summaryData = data?.data;

  


  return (
    <div className="flex flex-row items-center ">
      <div className="flex-1 lg:flex-[1] grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-20 px-4">
        <SummaryCard
          title="Available Balance"
          value={summaryData?.availableBalance}
          dateRange={dateRange}
          percentageChange={summaryData?.percentageChange.balance}
          isLoading={false}
          cardType="balance"
          fmt={fmt}
        />
        <SummaryCard
          title="Total Income"
          value={summaryData?.totalIncome}
          percentageChange={summaryData?.percentageChange.income}
          dateRange={dateRange}
          isLoading={false}
          cardType="income"
           fmt={fmt}
        />
        <SummaryCard
          title="Total Expenses"
          value={summaryData?.totalExpenses}
          dateRange={dateRange}
          percentageChange={3.5}
          isLoading={false}
          cardType="expenses"
           fmt={fmt}
        />
        <SummaryCard
          title="Savings Rate"
          value={summaryData?.savingRate.percentage}
          expenseRatio={summaryData?.savingRate.expenseRatio}
          isPercentageValue
          dateRange={dateRange}
          isLoading={false}
          cardType="savings"
           fmt={fmt}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
