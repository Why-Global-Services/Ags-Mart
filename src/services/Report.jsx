import apiInstance from "../Interceptor/interceptor";

export const getReport = async (params) => {
    const res = await apiInstance.get(`/getReport`,{params : params});
    return res;
  };
  
  export const getReportInventory = async (params) => {
    const res = await apiInstance.get(`/getInventoryReport`,{params : params});
    return res;
  };
  

export const downloadPdfReport = async (params) => {
    try {
      const response = await apiInstance.get("/getReport", {
        params: params,
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/pdf',
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading PDF report:", error);
      throw error;
    }
  };

