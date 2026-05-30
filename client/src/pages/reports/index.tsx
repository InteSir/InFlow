import {
  Card,
  CardContent,
} from "@/components/ui/card";
import PageLayout from "@/components/page-layout";
// import ScheduleReportDrawer from "./_component/schedule-report-drawer";
import ReportTable from "./_component/report-table";


export default function Reports() {
 
  return (
    <PageLayout
      title="Report History"
      subtitle="View and manage your financial reports"
      addMarginTop

    >
        <Card className="border shadow-none max-w-[73rem] mx-auto">
          <CardContent className="px-0">
           <ReportTable />
          </CardContent>
        </Card>
    </PageLayout>
  );
}
