import apiInstance from "../../Interceptor/interceptor";

export const getAllSystemUsers = async () => {
  const token = localStorage.getItem("Token");
  try {
    const response = await apiInstance.get(`/allAdmin`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getSystemUserById = async (id) => {
  const res = await apiInstance.get(`/getAdminById/${id}`);
  return res.data;
};

export const deleteSystemUser = async (userId) => {
  const res = await apiInstance.delete(`/deleteAdmin/${userId}`);
  return res.data;
};

export const updateSystemUser = async (_id, userData) => {
  const res = await apiInstance.put(`/editAdmin/${_id}`, userData);
  return res.data;
};

export const createSystemUser = async (data) => {
  const res = await apiInstance.post("/systemUser", data);
  return res.data;
};