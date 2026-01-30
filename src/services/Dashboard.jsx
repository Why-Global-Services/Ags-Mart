import apiInstance from "../Interceptor/interceptor";

export const getDashboard = async () => {
    const res = await apiInstance.get(`/dashboard`);
    return res;
  };
  