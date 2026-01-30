import React from "react";
import Dashboard from "./Dashboard";
import LatestTransactions from "./LatestTransactions";
import MonthlyEarning from "./MonthlyEarning";
import BestSellers from "./BestSellers";
import { DashboardProvider } from "../../context/DashboardContext";

const Dmain = () => {
  return (
    <DashboardProvider>
    <div className="bg-gray-100">
      <Dashboard />
      <MonthlyEarning />
      <BestSellers />
      <LatestTransactions />
    </div>
    </DashboardProvider>
  );
};

export default Dmain;
