import apiInstance from "../Interceptor/interceptor";

export const createNotification = async (data) => {
  try {
    const response = await apiInstance.post(`/notification`, data,{ headers: {
        "Content-Type": "multipart/form-data",
      }});
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getNotification = async () => {
  const res = await apiInstance.get(`/getNotification`);
  return res;
};

