
import { useState } from 'react'
import { useGetAllReportsQuery } from '@/features/report/reportAPI'
import { Clock} from 'lucide-react'

export type ReportStatus =
  | "SENT"
  | "FAILED"
  | "PENDING"
  | "NO_ACTIVITY";

const STATUS_STYLES: Record<ReportStatus, string> = {
  SENT:        "bg-green-100  text-green-800 dark:bg-green-200 dark:text-black",
  FAILED:      "bg-red-100    text-red-800",
  PENDING:     "bg-yellow-100 text-yellow-800",
  NO_ACTIVITY: "bg-gray-100   text-gray-600",
};
 
const StatusBadge = ({ status }: { status: string}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
      ${STATUS_STYLES[status as ReportStatus] ?? "bg-gray-100 text-gray-600"}`}
  >
    {status}
  </span>
);
const ReportTable = () => {
  const [filter] = useState({
    pageNumber: 1,
    pageSize: 10,
  })

  const { data, isFetching } = useGetAllReportsQuery(filter);

  const reports = data?.reports ?? [];
  

  return (
    <div className='w-full space-y-4'>
      <div className='w-full overflow-x-auto'>
        <table className='w-full text-sm text-left border-collapse '>
          <thead className='bg-gray-50 dark:bg-[#C6FF34]/90 sticky top-0 z-10 '>
            <tr>
              {["Report Period", "Frequency", "Sent Date", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-medium text-gray-600 dark:text-black dark:font-bold text-[13px]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isFetching && (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-zinc-800">
                    <td colSpan={6} className="py-4 text-center">
                      <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-full max-w-[90%] mx-auto" />
                    </td>
                  </tr>
                ))
            )}
            {/* Empty state */}
            {!isFetching && reports.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                  No reports found.
                </td>
              </tr>
            )}

            {!isFetching && reports.map((report)=>(
              <tr key={report._id} className=''>
                <td className='px-4 py-3 text-[13.3px]'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-3.5 w-3.5 shrink-0 text-gray-400' />
                    <span>{report.period}</span>
                  </div>
                </td>
                 <td className="px-4 text-[13.3px] text-gray-600 dark:text-gray-400 ">
                    {report.frequency}
                  </td>

                 <td className="px-4 py-3 text-[13.3px] text-gray-600 dark:text-gray-400">
                    {new Date(report.sentDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>



              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default ReportTable