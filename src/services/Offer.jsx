import apiInstance from "../Interceptor/interceptor";

export const getOffer = async () => {
  const res = await apiInstance.get(`/getOffers`);
  return res;
};



export const createOfferData = async (data) => {
  const res = await apiInstance.post(`/createOffers`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const updateOfferData = async (id, data) => {
  const res = await apiInstance.put(`/updateOffers/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const updateOfferStatus = async (offerId, newStatus) => {
  const res = await apiInstance.put(`/updateOfferStatus/${offerId}`, { status: newStatus },);
  return res;
};

export const deleteOffer = async (id) => {
  const res = await apiInstance.delete(`/deleteOffer/${id}`);
  return res;
};


export const getOfferProducts = async (id) => {
  const res = await apiInstance.get(`/getOfferProducts/${id}`);
  return res;
};

export const getAllCategories  = async () => {
  const res = await apiInstance.get(`/getAllCategory`);
  return res;
};

export const getSubCategoriesByCategory = async (categoryId) => {
  try {
    const response = await apiInstance.get(
      `/getSubCategoryBasedOnCategory/${categoryId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

export const getAllProducts  = async (id) => {
  const res = await apiInstance.get(`/getOfferAndNotAppliedProducts/${id}`);
  return res;
};


export const assignProductsToOffer = async (offerId, productIds) => {
  try {
    const response = await apiInstance.post(
      `/addOfferProducts`,
      {
        offerId,
        productIds,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning products:", error);
    throw error;
  }
};

export const updateProductsToOffer = async (offerId, productIds) => {
  try {
    const response = await apiInstance.put(`/updateOfferProducts/${offerId}`, {
      productIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
};