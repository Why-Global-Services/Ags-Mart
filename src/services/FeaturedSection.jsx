import apiInstance from "../Interceptor/interceptor";

export const createFeaturedSection = async (data) => {
  try {
    const response = await apiInstance.post(`/createFeaturedSection`, data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateFeaturedSection = async (id, data) => {
  try {
    const response = await apiInstance.put(
      `/updateFeaturedSection/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllFeatured = async () => {
  const res = await apiInstance.get(`/getFeaturedSection`);
  return res;
};

export const deleteFeaturedSection = async (id) => {
  const res = await apiInstance.delete(`/deleteFeaturedSection/${id}`);
  return res;
};

export const updatefeaturedStatus = async (featuredId, newStatus) => {
  const res = await apiInstance.put(`/updateStatusFeatureSection/${featuredId}`, {
    status: newStatus,
  });
  return res;
};

export const getFeaturedProducts = async (id) => {
  const res = await apiInstance.get(`/getFeaturedProducts/${id}`);
  return res;
};


export const assignProductsToFeature = async (featuredId, productIds) => {
  try {
    const response = await apiInstance.post(
      `/addFeaturedProducts`,
      {
        featuredId,
        productIds,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning products:", error);
    throw error;
  }
};

export const updateProductsToFeature = async (featuredId, productIds) => {
  try {
    const response = await apiInstance.put(`/updateFeaturedProducts/${featuredId}`, {
      productIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
};


export const getAllProductsFeaturedSection  = async (id) => {
  const res = await apiInstance.get(`/getFeaturedAndNotAppliedProducts/${id}`);
  return res;
};
