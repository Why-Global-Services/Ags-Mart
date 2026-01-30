import apiInstance from "../Interceptor/interceptor";

// API calls for subcategories
export const getSubCategory = async () => {
  const res = await apiInstance.get(`/getSubCategory`);
  return res;
};

export const getSubCategoryById = async (id) => {
  const res = await apiInstance.get(`/getOneSubCategory/${id}`);
  return res;
};

export const createSubCategory = async (data) => {
  const res = await apiInstance.post(`/createSubCategory`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const updateSubCategory = async (id, data) => {
  const res = await apiInstance.put(`/updateSubCategory/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const deleteSubCategory = async (id) => {
  const res = await apiInstance.delete(`/deleteSubCategory/${id}`);
  return res;
};
