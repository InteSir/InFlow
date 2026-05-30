
import { useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI"
import { ChevronRight , RefreshCw } from "lucide-react"
import useEditTransactionDrawer from "@/hooks/use-edit-transaction-drawer";
import useCurrency from "@/hooks/use-currency";

const urgencyStyles = {
  overdue: {
    
    label: "text-red-500",
    bar: "bg-red-100",
    
  },
  today: {
   
    label: "text-orange-500",
    bar: "bg-orange-50",
   
  },
  soon: {
   
    label: "text-yellow-600",
    bar: "bg-yellow-50",
   
  },
  upcoming: {
 
    label: "text-gray-400",
    bar: "bg-gray-50",
   
  },
};


function getDueLabel(nextRecurringDate?:string | Date | null):{
      label: string;
      urgency: "overdue" | "today" | "soon" | "upcoming";
}{
    if(!nextRecurringDate){
        return {label:"No due date",urgency:"upcoming"};
    }

    const now = new Date();
    const due = new Date(nextRecurringDate);

    const nowDay = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const diffMs = dueDay.getTime() - nowDay.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        const abs = Math.abs(diffDays);
        return {
        label: abs === 1 ? "Overdue by 1 day" : `Overdue by ${abs} days`,
        urgency: "overdue",
        };
    }
    if (diffDays === 0) return { label: "Due today", urgency: "today" };
    if (diffDays === 1) return { label: "Due tomorrow", urgency: "soon" };
    if (diffDays <= 7) return { label: `Due in ${diffDays} days`, urgency: "soon" };
    if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return {
        label: weeks === 1 ? "Due in a week" : `Due in ${weeks} weeks`,
        urgency: "upcoming",
        };
    }
    return {
        label: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        urgency: "upcoming",
    };
}


function CategoryAvatar({
  category,
  urgency,
}: {
  category: string;
  urgency: keyof typeof urgencyStyles;
}) {
  const colorMap: Record<string, string> = {
    overdue: "bg-red-100 text-red-600",
    today: "bg-orange-100 text-orange-600",
    soon: "bg-yellow-100 text-yellow-700",
    upcoming: "bg-gray-100 text-gray-600",
  };
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${colorMap[urgency]}`}
    >
      {category.charAt(0).toUpperCase()}
    </div>
  );
}
 

const RecurrentTransactions = () => {
  const {data,isFetching} = useGetAllTransactionsQuery({
    keyword:undefined,
    type:undefined,
    recurringStatus: "RECURRING",
    pageNumber:1,
    pageSize:5,

  });
  const {fmt} = useCurrency();

  const transactions = data?.Transactions || [];
  const {onOpenDrawer} = useEditTransactionDrawer();



  return (
    <div className="bg-[var(--card)] rounded-2xl overflow-hidden dark:bg-card dark:border-border shadow-[0_4px_20px_-2px_rgba(20,20,20,0.04),0_2px_6px_-1px_rgba(20,20,20,0.02)] border border-black/5">
        {/* Header */}
        <div className="flex flex-col gap-1.5 items-center justify-between px-5 pt-5 pb-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight dark:text-white">Upcoming Bills & Payments</h2>
            <p className="text-xs text-gray-400">Recurring transactions</p>
        </div>

         <div className="border-t border-gray-100 dark:border-gray-700" />

         {/* Content */}
         <div>
            {isFetching ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-200  border-t-gray-500 rounded-full animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <RefreshCw size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No recurring transactions</p>
          </div>
        ) : (
            <ul className="space-y-1">
                {transactions.map((transaction: any) => {
                    const { label, urgency } = getDueLabel(
                        transaction.nextRecurringDate
                    );
                    const styles = urgencyStyles[urgency];

                    return(
                        <li key={transaction.id}>
                            <div className="flex items-center gap-3 py-4 px-5 rounded-xl border border-gray-200 m-3 dark:border-gray-700">
                                    {/* Avatar */}
                                    <CategoryAvatar
                                    category={transaction.category}
                                    urgency={urgency}
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-md font-semibold text-gray-800 truncate dark:text-white"> {transaction.title}</p>
                                            
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`text-xs font-medium ${styles.label}`}>
                                            {label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold ${
                                                transaction.type === "INCOME"
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                                } dark:text-[#C6FF34]/90 `}>
                                                  {fmt(transaction.amount,{type:transaction.type,compact:"true"})}

                                            </p>
                                            <p className="text-xs text-gray-400 capitalize">
                                                {transaction.paymentMethod?.toLowerCase().replace("_", " ")}
                                            </p>
                                    </div>

                                    <div className="">
                                         <ChevronRight size={18} className="text-gray-900 hover:scale-125 cursor-pointer dark:text-gray-50" onClick={()=>onOpenDrawer(transaction.id)}/>
                                        
                                    </div>

                            </div>
                        </li>

                    )

                }
                
                )}

            </ul>
        )}
         </div>
         
       

    </div>
  )
}

export default RecurrentTransactions