import apiInstance from "../Interceptor/interceptor";



// API calls for categories
export const getCategory = async () => {
    const res = await apiInstance.get(`/getAllCategory`);
    return res;
  };
  
  export const getCategoryById = async (id) => {
    const res = await apiInstance.get(`/getOneCategory/${id}`);
    return res;
  };
  
  export const createCategory = async (data) => {
    const res = await apiInstance.post(`/createCategory`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  };
  
  export const updateCategory = async (id, data) => {
    const res = await apiInstance.put(`/editcategory/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  };
  
  export const deleteCategory = async (id) => {
    const res = await apiInstance.delete(`/deletecategory/${id}`);
    return res;
  };
  