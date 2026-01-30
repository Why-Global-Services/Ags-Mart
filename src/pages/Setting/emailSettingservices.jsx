import apiInstance from "../../Interceptor/interceptor";

export const getEmailSettings = async () => {
  try {
    const response = await apiInstance.get('/getEmailsettings');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error);
    throw error;
  }
};

export const postEmailSettings = async (data) => {
  try {
    const response = await apiInstance.post('/emailsettings', data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error);
    throw error;
  }
};