import { useEffect, useRef, useState } from "react";
import useDebounce  from "@/hooks/use-debounce-search";
import { useBulkDeleteTransactionMutation, useDeleteTransactionMutation, useDuplicateTransactionMutation, useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import useEditTransactionDrawer from "@/hooks/use-edit-transaction-drawer";
import useCurrency from "@/hooks/use-currency";



type FilterType = {
  type?: "INCOME" | "EXPENSE"| undefined,
  recurringStatus?:"RECURRING" | "NON_RECURRING" | undefined;
  pageNumber?: number;
  pageSize?: number;

}

function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
}:{
   placeholder: string;
   value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}){
  return(
    <div className="relative">
      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-2 text-sm text-gray-600 bg-white hover:border-gray-300 cursor-pointer dark:bg-[#121212] dark:text-gray-200">
        <Plus size={14} className="text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent pr-3 lg:pr-4 focus:outline-none cursor-pointer "
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="dark:text-black">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="text-gray-400 pointer-events-none absolute right-2.5" />
      </div>
    </div>
  )

}

function SortableHeader ({label}:{label:string}){
  return (
    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-800 uppercase tracking-wide whitespace-nowrap">
      <button className="flex items-center gap-3 hover:text-gray-700 transition-colors">
        {label}
        <ArrowUpDown size={15} className="text-gray-800"/>
      </button>
    </th>
  );
}

function RowMenu({
  transactionId,
  onDuplicate,
  onDelete,
}:{
  transactionId:string;
  onDuplicate:()=>void;
  onDelete:()=>void;
}){
  const [open,setOpen] = useState(false);
  const {onOpenDrawer} = useEditTransactionDrawer();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const handler = (e:MouseEvent) =>{
      if(ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
    };
    document.addEventListener("mousedown",handler);
    return ()=>document.removeEventListener("mousedown",handler);
  },[]);

  
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen((v)=>!v)}> <MoreHorizontal size={16} /></button>
      {open && (
        <div className="absolute right-0 top-7 z-50 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
          <button onClick={()=>onOpenDrawer(transactionId)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 transition-colors"> <Pencil size={14} className="text-gray-400" />Edit
          </button >
          <button onClick={() => { onDuplicate(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 transition-colors">
             <Copy size={14} className="text-gray-400" />
              Duplicate

          </button>
           <hr className="my-1 border-gray-100" />
           <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-1 hover:bg-red-50 text-red-500 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )



}
export default function TransactionTable(props:{pageSize?:number,isShowPagination?:boolean}){

  const {fmt} = useCurrency();
  
  const [search,setSearch] = useState("");

  const [selectedIds,setSelectedIds] = useState<string[]>([]); 

  const [filter,setFilter] = useState<FilterType>({
    type:undefined,
    recurringStatus:undefined,
    pageNumber:1,
    pageSize:props.pageSize ||10,
  });

  

  const debouncedSearch = useDebounce(search,500);

  const {data,isFetching} = useGetAllTransactionsQuery({
    keyword:debouncedSearch,
    type:filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber:filter.pageNumber,
    pageSize:filter.pageSize,
  });
  const [deleteTransaction,{isLoading:isDeleting}] = useDeleteTransactionMutation();
  const[duplicateTransaction,{isLoading:isDuplicating}] = useDuplicateTransactionMutation();

  const [bulkDeleteTransaction,{isLoading:isBulkDeleting}] = useBulkDeleteTransactionMutation(); 

  const transactions = data?.Transactions || [];
  console.log(data?.pagination)

  const pagination = {
    totalItems:data?.pagination?.totalCounts || 0,
    totalPages: data?.pagination?.totalPages || 0,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  }

  const allSelected = transactions.length > 0 &&  transactions.every((t: any) => selectedIds.includes(t.id));

  const toggleAll = () =>{
    if(allSelected) setSelectedIds([]);
    else setSelectedIds(transactions.map((t: any) => t.id));
  }
  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };



  const handleDeleteOne = (id:string)=>{
    deleteTransaction(id)
      .unwrap()
      .then(() => toast.success("Transaction deleted"))
      .catch((error) => {
        toast.error(error.data?.message || "Failed to delete transactions");
      });
  }

  const handleDuplicate = (id: string) => {
      duplicateTransaction(id)
        .unwrap()
        .then(() => toast.success("Transaction duplicated"))
        .catch((error) => {
        toast.error(error.data?.message || "Failed to duplicate");
      });
    };

  const handleBulkDelete  = ()=>{
    bulkDeleteTransaction(selectedIds)
      .unwrap()
      .then(() => {
        toast.success("Transactions deleted successfully");
        setSelectedIds([]);
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to delete transactions");
      });
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setFilter((prev) => ({ ...prev, pageNumber: page }));
  };

  const pageNumbers = Array.from(
    { length: Math.min(pagination.totalPages, 3) },
    (_, i) => i + 1
  );

  // ── Formatting helpers ─────────────────────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  // const fmtAmount = (amount: number, type: string) => {
  //   const sign = type === "INCOME" ? "+" : "-";
  //   return `${sign}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  // };



  return(
    <div className="bg-white  overflow-hidden dark:bg-[#121212] ">
      {/* TOPBAR */}
      {(props.isShowPagination ?? true) && (<>
            <div className="flex flex-col  gap-3 py-4 border-b border-gray-100 dark:border-none lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full lg:max-w-xs ">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>

              <input type="text" placeholder = "Search transaction ..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full border border-gray-200 rounded-lg pr-4 pl-9 text-sm py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400" />
              </div>


              <div className="flex flex-1 w-full justify-between lg:justify-start">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                {/* Filter */}
                    <FilterSelect 
                      placeholder="All Types"
                      value={filter.type ?? ""}
                      onChange={(v) =>
                          setFilter((prev) => ({
                            ...prev,
                            type: v as "INCOME" | "EXPENSE" | undefined || undefined,
                            pageNumber: 1,
                          }))
                        }
                        options={[
                          { label: "Income", value: "INCOME" },
                          { label: "Expense", value: "EXPENSE" },
                        ]}
                    />
                    {/* Recurring filter */}
                    <FilterSelect
                      placeholder="Frequently"
                      value={filter.recurringStatus ?? ""}
                      onChange={(v) =>
                        setFilter((prev) => ({
                          ...prev,
                          recurringStatus:
                            (v as "RECURRING" | "NON_RECURRING" | undefined) || undefined,
                          pageNumber: 1,
                        }))
                      }
                      options={[
                        { label: "Recurring", value: "RECURRING" },
                        { label: "Non-Recurring", value: "NON_RECURRING" },
                      ]}
                    />

                </div>
                              {/* Bulk Delete */}
              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="ml-auto flex  items-center gap-1.5 px-1 lg:px-3 py-2 text-[0.6rem] lg:text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={14} />
                  Delete ({selectedIds.length})</button>
              )}

              </div>





              
            
            </div>
      </>)}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 shadow-sm rounded-2xl  
        
        dark:shadow-[0_4px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] dark:bg-card ">
        <table className="w-full text-sm">
          <thead className="bg-gray-200  dark:bg-[#C6FF34]/90">
            <tr>
              {(props.isShowPagination ?? true) && (
                <>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-gray-700 focus:ring-gray-400 dark:border-white/20 dark:focus:ring-white/2
                        bg-transparent"
                    />
                  </th>
                  <SortableHeader label="Date Created" />
                </>

              )}

              <th className="text-center px-4 py-3 text-sm font-semibold text-gray-800 tracking-wide dark:text-[#121212] ">
                Transactions
              </th>
              <SortableHeader label="Category" />
              {/* <th className="text-left px-4 py-3 text-sm font-semibold text-gray-800  tracking-wide">
                Type
              </th> */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-800  tracking-wide">
                Amount
              </th>
              <SortableHeader label="Transaction Date" />
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-800  tracking-wide">
                Payment Method
              </th>
              {(props.isShowPagination ?? true) && (<>
              
                      <SortableHeader label="Frequently" />
                      <th className="px-4 py-3 w-10" />
                </>)}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {isFetching ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction)=>(
                <tr key={transaction.id} className="hover:bg-gray-50/70 transition-colors group dark:hover:bg-gray-950 ">

                  {(props.isShowPagination ?? true) && (
                  <>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(transaction.id)}
                          onChange={() => toggleOne(transaction.id)}
                          className="rounded border-gray-300 text-gray-700 focus:ring-gray-400 cursor-pointer"
                        />
                      </td>
                      <td className=" p-3 text-gray-600 whitespace-nowrap dark:text-white">
                        {fmtDate(transaction.createdAt)}
                      </td>
                      </>
                  )}
                  {/* Date Created */}
                  
                  {/* Title */}
                  <td className="px-4 py-3 font-medium text-gray-700 max-w-[200px] truncate dark:text-white">
                    {transaction.title}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-gray-700 dark:text-white">{transaction.category}</td>

                   {/* Type badge */}
                   {/* <td className="px-4 py-3">
                    <span className={`items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${ 
                      transaction.type === "INCOME"
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-500 border border-red-100"}`}>
                       {transaction.type}
                    </span>

                   </td> */}
                  {/* Amount */}
                  <td
                    className={`px-4 py-3 text-right  font-semibold tabular-nums ${
                      transaction.type === "INCOME"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {/* {fmtAmount(transaction.amount, transaction.type)} */}
                    {fmt(transaction.amount, { type: transaction.type,compact:true })}
                  </td>

                   {/* Transaction date */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap  dark:text-white">
                    {transaction.date ? fmtDate(transaction.date) : "—"}
                  </td>

                  {/* Payment method */}
                  <td className="px-4 py-3 text-gray-600  dark:text-white">
                    {transaction.paymentMethod ?? "—"}
                  </td>

                  {(props.isShowPagination ?? true) && (<>
                  {/* Frequently */}
                  <td className="px-4 py-3 text-gray-500  dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <Clock size={15} className="text-gray-400" />
                      <span className="text-sm">
                        {transaction.isRecurring ? "Recurring" : "One-time"}
                      </span>
                    </div>
                  </td>

                   {/* Row menu */}
                  <td className="px-4 py-3 text-right  dark:text-white">
                     <RowMenu 
                        transactionId={transaction.id}
                          onDuplicate={() => handleDuplicate(transaction.id)}
                          onDelete={() => handleDeleteOne(transaction.id)}
                     />
                  </td>
                  </>)}


                  



                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

          {/* ── Footer / Pagination ── */}
          {(props.isShowPagination ?? true) && (
            <div className="flex items-center justify-between px-0 lg:px-5 py-3 border-t border-gray-100 text-sm text-gray-700 dark:text-white">
              <span className="hidden lg:block">
                Showing{" "}
                {pagination.totalItems === 0 ? "0" : 
                `${(pagination.pageNumber - 1) * pagination.pageSize + 1}-${Math.min(pagination.pageNumber * pagination.pageSize,pagination.totalItems)}`}{" "} of {pagination.totalItems}
              </span>

              {/* Rows per page + page controls */}
              <div className="flex items-center gap-4 dark:text-white">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <span className="hidden lg:flex">
                    Rows per page
                  </span>
                  <div className="relative">
                    <select value={filter.pageSize} onChange={(e)=>setFilter((prev)=>({...prev,pageSize:Number(e.target.value),pageNumber:1,}))}
                      className="appearance-none border border-gray-300 rounded-lg pl-3 pr-7 py-1.5 text-sm  focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer bg-white dark:text-black">
                      {[5,10,20,50].map((n)=>(
                        <option key={n} value={n}
                        >
                          {n}
                        </option>
                      ))}

                    </select>
                     <ChevronDown
                      size={15}
                      className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                    />
                  </div>
                
                </div>

                 {/* Page label */}
                  <span className="whitespace-nowrap">
                    Page {pagination.pageNumber} of {pagination.totalPages || 1}
                  </span>

                  {/* Prev */}
                  <button onClick={()=>goToPage(pagination.pageNumber-1)}
                    disabled={pagination.pageNumber<=1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:hover:text-black"><ChevronLeft size={15} />
                    <span className="hidden lg:block">Previous</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {pageNumbers.map((n)=>(
                      <button key={n} onClick={()=>goToPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n===pagination.pageNumber ? "bg-gray-900 text-white dark:bg-[#C6FF34]/90 dark:text-black": "hover:bg-gray-200 text-gray-600 border border-gray-200 bg-gray-50 "}`}> {n}</button>
                    ))}
                  </div>
                  {/* Next */}
                  <button
                    onClick={() => goToPage(pagination.pageNumber + 1)}
                    disabled={pagination.pageNumber >= pagination.totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:hover:text-black"
                  >
                    <span className="hidden lg:block">Next</span>
                    <ChevronRight size={14} />
                  </button>



              </div>
            </div>
          )}



    </div>
  )


}