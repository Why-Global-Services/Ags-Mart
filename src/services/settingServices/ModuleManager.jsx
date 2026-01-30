import apiInstance from "../../Interceptor/interceptor";

export const getModuleManaging = async () => {
    const res = await apiInstance.get(`/getModuleManager`);
    return res;
  };
  
  export const createModuleManaging = async (data) => {
    const res = await apiInstance.post(`/editModuleManager`, data);
    return res;
  };
  