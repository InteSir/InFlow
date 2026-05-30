import DashboardDataChart from "./dashboard-data-chart";
import DashboardSummary from "./dashboard-summary";
import PageLayout from "@/components/page-layout";
//import ExpenseBreakDown from "./expense-breakdown";
import ExpensePieChart from "./expense-pie-chart";
import DashboardRecentTransactions from "./dashboard-recent-transactions";
import { useState } from "react";
import { DateRangeType } from "@/components/date-range-select";
import RecurrentTransactions from "./_component/recurrentTransactions";
import DashboardStats from "./_component/dashboard-stats";

const Dashboard = () => {
    const [dateRange, _setDateRange] = useState<DateRangeType>(null);

    
  return (
    <div className="w-full flex flex-col ">
      {/* Dashboard Summary Overview */}
      <PageLayout className="space-y-6 max-w-[75rem]" pageHeaderClassName="pb-2"
          renderPageHeader={<DashboardSummary dateRange={dateRange} setDateRange={_setDateRange} />}
      >
        <DashboardStats 
        dateRange={dateRange}
        />
        {/* Dashboard Main Section */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-8 ">
          <div className="lg:col-span-4">
            <DashboardDataChart dateRange={dateRange}/>
          </div>
          <div className="lg:col-span-2">
            <ExpensePieChart dateRange={dateRange} />
          </div>
        </div>
        {/* Dashboard Recent Transactions */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-6 gap-8 ">


          <div className="lg:col-span-2">
            <RecurrentTransactions  />
          </div>
          <div className="lg:col-span-4">
          <DashboardRecentTransactions />
        </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default Dashboard;
