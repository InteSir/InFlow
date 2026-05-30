// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import PageLayout from "@/components/page-layout";
import AddTransactionDrawer from "@/components/transaction/add-transaction-drawer";
import TransactionTable from "@/components/transaction/transaction-table";
import ImportTransactionModal from "@/components/transaction/import-transaction-modal";

export default function Transactions() {

  return (


    <div>
      {/* PageHeader */}
      <div className="w-full pb-10 pt-10 px-4 bg-[var(--secondary-dark-color)] text-white dark:bg-[#121212] lg:pb-20">
        <div className="w-full mx-auto max-w-[75rem]">
          <div className="w-full flex flex-col lg:flex-row gap-6  lg:gap-3 items-center lg:items-start justify-between ">
            <div className="space-y-1">
              <h2 className="text-2xl lg:text-4xl font-medium">All Transactions</h2>
              <p className="text-white/60 text-sm">Showing all transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <ImportTransactionModal />
              <AddTransactionDrawer/>
            </div>
          </div>
        </div>
      </div>

      {/* PageContent */}
      <div className=" max-w-[75rem] bg-white rounded-xl  mx-auto p-4  -mt-10 dark:bg-[#121212] shadow-[0_4px_20px_-2px_rgba(20,20,20,0.04),0_2px_6px_-1px_rgba(20,20,20,0.02)] border border-black/5">
        <div className="pt-2">
          <TransactionTable pageSize={20} />
        </div>
      </div>
    </div>
  );
}
