import React from "react";
import Dashboard from "./Dashboard";
import LatestTransactions from "./LatestTransactions";
import MonthlyEarning from "./MonthlyEarning";
import BestSellers from "./BestSellers";
import { DashboardProvider } from "../../context/DashboardContext";

const Dmain = () => {
  return (
    <DashboardProvider>
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] via-[#f0f7f2] to-[#e8f3ec] p-2 sm:p-4 space-y-6">
      <Dashboard />
      <MonthlyEarning />
      <BestSellers />
      <LatestTransactions />
    </div>
    </DashboardProvider>
  );
};

export default Dmain;
