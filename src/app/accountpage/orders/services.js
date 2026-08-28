import apiInstance from "../../interceptor/interseptor";

export const addEditReviewRating = async (productId, variantId, reviewData) => {
  try {
    const response = await apiInstance.post(
      `/addEditReviewRating?productId=${productId}&variantId=${variantId}`,
      reviewData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to edit address");
  }
};
