import apiInstance from "../../Interceptor/interceptor";

export const getPaymentMethod = async () => {
    const res = await apiInstance.get(`/getPaymentMethod`);
    return res;
  };
  
  export const createPaymentMethods = async (data) => {
    const res = await apiInstance.post(`/paymentMethods`, data);
    return res;
  };
  