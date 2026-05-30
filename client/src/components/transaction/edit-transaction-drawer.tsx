import { useEffect, useRef } from "react";
import TransactionForm from "./transaction-form";
import useEditTransactionDrawer from "@/hooks/use-edit-transaction-drawer";
import { X } from "lucide-react";

const EditTransactionDrawer = () => {
  const { open, transactionId, onCloseDrawer } = useEditTransactionDrawer();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCloseDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCloseDrawer]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onCloseDrawer}
        className="fixed inset-0 z-40 bg-black/40 transition-opacity"
      />

      {/* Drawer panel — slides in from the right */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-md
          bg-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out dark:bg-card
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              Edit Transaction
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Edit a transaction to track your finances
            </p>
          </div>
          <button
            onClick={onCloseDrawer}
            className="p-1.5 rounded-lg  text-gray-400 hover:text-gray-600 transition-colors mt-0.5 dark:text-gray-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto">
          <TransactionForm
            isEdit
            transactionId={transactionId}
            onCloseDrawer={onCloseDrawer}
          />
        </div>
      </div>
    </>
  );
};

export default EditTransactionDrawer;