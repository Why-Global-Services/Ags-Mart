// /pay/context/PaymentContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getPaymentMethod } from "../services/settingServices/PaymentMethod";


const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentData = async () => {
    try {
      const response = await getPaymentMethod();
      console.log(response.data,'responce data in payment methods');
      
      setPaymentData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const updatePaymentData = (newData) => {
    setPaymentData(prev => ({ ...prev, ...newData }));
  };

  return (
    <PaymentContext.Provider value={{ paymentData, loading, error, updatePaymentData }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};