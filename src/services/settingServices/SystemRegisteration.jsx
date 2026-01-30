import apiInstance from "../../Interceptor/interceptor";



export const getSystemRegistration = async () => {
    try {
      const response = await apiInstance.get('/getPurchaseCode');
      return response.data;
    } catch (error) {
      console.error('Error fetching system registration data:', error);
      throw error;
    }
  };
  
  export const registerSystem = async (registrationData) => {
    try {
      const response = await apiInstance.post('/editPurchaseCode', registrationData);
      return response.data;
    } catch (error) {
      console.error('Error registering system:', error);
      throw error;
    }
  };