import Navbar from "@/components/navbar";
import { Outlet } from "react-router-dom";
import EditTransactionDrawer from "@/components/transaction/edit-transaction-drawer";

const AppLayout = () => {
  return (
    <>
    <div className="min-h-screen pb-10 bg-[var(--bg-color)] dark:bg-[#121212]">
      <Navbar />
      <main className="w-full max-w-full">
        <Outlet />
      </main>
    </div>
    <EditTransactionDrawer />
    </>
  );
};

export default AppLayout;
