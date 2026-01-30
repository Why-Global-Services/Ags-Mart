import apiInstance from "../Interceptor/interceptor";

export const adminLogin = async (data) => {
  console.log(data, "kkkkkkkkkk");
  const res = await apiInstance.post(`/adminLogin`, data);
  return res;
};
