import apiInstance from '../Interceptor/interceptor'


export const getAllProduct = async () => {
  const res = await apiInstance.get(`/getProducts`);
  return res;
};

export const getProductById = async (id) => {
  const res = await apiInstance.get(`/getSingleProduct/${id}`);
  return res;
};

export const createProduct = async (data) => {
  const res = await apiInstance.post(`/addProducts`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const updateProduct = async (id, data) => {
  const res = await apiInstance.put(`/editProduct/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const deleteProduct = async (_id) => {
  const res = await apiInstance.delete(`/deleteProduct/${_id}`);
  return res;
};


export const updateProductStatus = async (_id, field, newStatus) => {
  const res = await apiInstance.put(`/editProductStatus/${_id}`, { field, value:newStatus },);
  return res;
};


export const getAllActiveProducts = async (categoryId) => {
  const res = await apiInstance.get(`/getActiveProducts?categoryId=${categoryId}`);
  return res;
};