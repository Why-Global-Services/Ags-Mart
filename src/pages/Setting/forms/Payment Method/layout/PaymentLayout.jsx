import { Outlet } from "react-router-dom";
import PaymentTabs from "../Slider/PaymentSlider";
import { PaymentProvider } from "../../../../../context/PaymentContext";

const PaymentLayout = () => {
  return (
    <PaymentProvider>
    <div className="min-h-screen bg-gray-50 p-6 space-y-4">
      <h1 className="text-xl font-bold text-pink-600">Settings Panel</h1>
      <PaymentTabs />
      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
    </PaymentProvider>
  );
};

export default PaymentLayout;
