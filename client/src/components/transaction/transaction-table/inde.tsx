import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useDebounce from "@/hooks/use-debounce-search";
import {
  useBulkDeleteTransactionMutation,
  useDeleteTransactionMutation,
  useDuplicateTransactionMutation,
  useGetAllTransactionsQuery,
} from "@/features/transaction/transactionAPI";
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

type FilterType = {
  type?: "INCOME" | "EXPENSE" | undefined;
  recurringStatus?: "RECURRING" | "NON_RECURRING" | undefined;
  pageNumber?: number;
  pageSize?: number;
};

// ── Row action menu ──────────────────────────────────────────────────────────
function RowMenu({
  transactionId,
  onDuplicate,
  onDelete,
}: {
  transactionId: string;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleEdit = () => {
    navigate(
      `/transactions?transactionId=${transactionId}&edit=true`
    );
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm">
          <button
            onClick={handleEdit}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Pencil size={14} className="text-gray-400" />
            Edit
          </button>
          <button
            onClick={() => { onDuplicate(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <Copy size={14} className="text-gray-400" />
            Duplicate
          </button>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sortable column header ────────────────────────────────────────────────────
function SortableHeader({ label }: { label: string }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
      <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
        {label}
        <ArrowUpDown size={12} className="text-gray-300" />
      </button>
    </th>
  );
}

// ── Filter dropdown ───────────────────────────────────────────────────────────
function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:border-gray-300 cursor-pointer">
        <Plus size={14} className="text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent pr-4 focus:outline-none cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="text-gray-400 pointer-events-none absolute right-2.5" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TransactionTable(props: {
  pageSize?: number;
  isShowPagination?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterType>({
    type: undefined,
    recurringStatus: undefined,
    pageNumber: 1,
    pageSize: props.pageSize || 10,
  });

  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching } = useGetAllTransactionsQuery({
    keyword: debouncedSearch,
    type: filter.type,
    recurringStatus: filter.recurringStatus,
    pageNumber: filter.pageNumber,
    pageSize: filter.pageSize,
  });

  const [deleteTransaction] = useDeleteTransactionMutation();
  const [duplicateTransaction] = useDuplicateTransactionMutation();
  const [bulkDeleteTransaction] = useBulkDeleteTransactionMutation();

  const transactions = data?.transaction || [];
  const pagination = {
    totalItems: data?.pagination?.totalCount || 0,
    totalPages: data?.pagination?.totalPages || 0,
    pageNumber: filter.pageNumber ?? 1,
    pageSize: filter.pageSize ?? 10,
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allSelected =
    transactions.length > 0 &&
    transactions.every((t: any) => selectedIds.includes(t.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(transactions.map((t: any) => t.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    deleteTransaction(id)
      .unwrap()
      .then(() => toast.success("Transaction deleted"))
      .catch((e: any) => toast.error(e.data?.message || "Failed to delete"));
  };

  const handleDuplicate = (id: string) => {
    duplicateTransaction(id)
      .unwrap()
      .then(() => toast.success("Transaction duplicated"))
      .catch((e: any) => toast.error(e.data?.message || "Failed to duplicate"));
  };

  const handleBulkDelete = () => {
    bulkDeleteTransaction(selectedIds)
      .unwrap()
      .then(() => {
        toast.success("Transactions deleted");
        setSelectedIds([]);
      })
      .catch((e: any) => toast.error(e.data?.message || "Failed to delete"));
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setFilter((prev) => ({ ...prev, pageNumber: page }));
  };

  const pageNumbers = Array.from(
    { length: Math.min(pagination.totalPages, 5) },
    (_, i) => i + 1
  );

  // ── Formatting helpers ─────────────────────────────────────────────────────
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const fmtAmount = (amount: number, type: string) => {
    const sign = type === "INCOME" ? "+" : "-";
    return `${sign}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 placeholder:text-gray-400"
          />
        </div>

        {/* Type filter */}
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

        {/* Bulk delete */}
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
            Delete ({selectedIds.length})
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/60">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-gray-700 focus:ring-gray-400"
                />
              </th>
              <SortableHeader label="Date Created" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Title
              </th>
              <SortableHeader label="Category" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Type
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Amount
              </th>
              <SortableHeader label="Transaction Date" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Payment Method
              </th>
              <SortableHeader label="Frequently" />
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
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
              transactions.map((transaction: any) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50/70 transition-colors group"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(transaction.id)}
                      onChange={() => toggleOne(transaction.id)}
                      className="rounded border-gray-300 text-gray-700 focus:ring-gray-400"
                    />
                  </td>

                  {/* Date Created */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {fmtDate(transaction.createdAt)}
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                    {transaction.title}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-gray-600">{transaction.category}</td>

                  {/* Type badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        transaction.type === "INCOME"
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-red-50 text-red-500 border border-red-100"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td
                    className={`px-4 py-3 text-right font-semibold tabular-nums ${
                      transaction.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {fmtAmount(transaction.amount, transaction.type)}
                  </td>

                  {/* Transaction date */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {transaction.date ? fmtDate(transaction.date) : "—"}
                  </td>

                  {/* Payment method */}
                  <td className="px-4 py-3 text-gray-600">
                    {transaction.paymentMethod ?? "—"}
                  </td>

                  {/* Frequently */}
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-300" />
                      <span className="text-xs">
                        {transaction.isRecurring ? "Recurring" : "One-time"}
                      </span>
                    </div>
                  </td>

                  {/* Row menu */}
                  <td className="px-4 py-3 text-right">
                    <RowMenu
                      transactionId={transaction.id}
                      onDuplicate={() => handleDuplicate(transaction.id)}
                      onDelete={() => handleDelete(transaction.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ── */}
      {(props.isShowPagination ?? true) && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
          {/* Showing */}
          <span>
            Showing{" "}
            {pagination.totalItems === 0
              ? "0"
              : `${(pagination.pageNumber - 1) * pagination.pageSize + 1}-${Math.min(
                  pagination.pageNumber * pagination.pageSize,
                  pagination.totalItems
                )}`}{" "}
            of {pagination.totalItems}
          </span>

          {/* Rows per page + page controls */}
          <div className="flex items-center gap-4">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <div className="relative">
                <select
                  value={filter.pageSize}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      pageNumber: 1,
                    }))
                  }
                  className="appearance-none border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer bg-white"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                />
              </div>
            </div>

            {/* Page label */}
            <span className="whitespace-nowrap">
              Page {pagination.pageNumber} of {pagination.totalPages || 1}
            </span>

            {/* Prev */}
            <button
              onClick={() => goToPage(pagination.pageNumber - 1)}
              disabled={pagination.pageNumber <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    n === pagination.pageNumber
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => goToPage(pagination.pageNumber + 1)}
              disabled={pagination.pageNumber >= pagination.totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}