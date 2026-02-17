import axios from "axios";
import { jwtDecode } from "jwt-decode";
// import { data } from "react-router-dom";

const apiInstance = axios.create({
  baseURL: "http://localhost:5001/v1/admin",
  // baseURL: "https://poviscollections.whydev.in/v1/admin",
});

const handleTokenExpiration = () => {
  console.error("Token expired, logging out...");
  console.error("Token expired, logging out...");
};

apiInstance.interceptors.request.use(
  async (config) => {
    const authToken = localStorage.getItem("Token");

    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        if (decoded.exp * 1000 < Date.now()) {
          handleTokenExpiration();
          return Promise.reject(new Error("Token expired"));
        }

        config.headers.Authorization = `Bearer ${authToken}`;
      } catch (error) {
        handleTokenExpiration();
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.data);
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        handleTokenExpiration();
      } else if (error.response.status === 500) {
        console.error("Server error, try again later.");
      }
    } else {
      console.error("Network or other error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiInstance;

export const getBrand = async () => {
  const res = await apiInstance.get(`/getBrand`);
  return res;
};

export const getBrandById = async (id) => {
  const res = await apiInstance.get(`/getOneBrand/${id}`);
  return res;
};

export const createBrand = async (data) => {
  const res = await apiInstance.post(`/createBrand`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const updateBrand = async (id, data) => {
  const res = await apiInstance.put(`/editBrand/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const deleteBrand = async (id) => {
  const res = await apiInstance.delete(`/deleteBrand/${id}`);
  return res;
};

export const getOrder = async () => {
  const res = await apiInstance.get(`/getOrders`);
  return res;
};

export const updateOrder = async (id, orderStatus, paymentStatus) => {
  const res = await apiInstance.put(
    `/editOrders/${id}`,
    { orderStatus, paymentStatus },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export const updateReturn = async (data) =>{
  const res = await apiInstance.put(
    `/returnreject`,data
  );
  return res.data;
}
export const getStoreSetting = async () => {
  const res = await apiInstance.get("/getStoreSettingData");
  return res;
};

export const updatestoreSettings = async (data) => {
  console.log("setting data", data);
  const res = await apiInstance.post("/storeSettingsData", data);
  return res;
};

// API calls for customers
export const getAllCustomers = async () => {
  const res = await apiInstance.get(`/customer`);
  return res;
};

export const getCustomerById = async (id) => {
  const res = await apiInstance.get(`/onecustomer/${id}`);
  return res;
};

export const updateCustomer = async (id, data) => {
  const res = await apiInstance.put(`/editcustomer/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const getReviews = async () => {
  try {
    const res = await apiInstance.get(`/getReviewsRatings`);
    
    // Always return res.data from interceptors (standard practice)
    return res; // ← This is critical!
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const createCoupon = async (data) => {
  const res = await apiInstance.post(`/createCoupon`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const getCoupons = async () => {
  const res = await apiInstance.get(`/getCoupon`);
  return res;
};

export const getOneCoupon = async (id) => {
  const res = await apiInstance.get(`/getOneCoupon/${id}`);
  return res;
};

export const editCoupon = async (id, data) => {
  const res = await apiInstance.put(`/editCoupon/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const deleteCoupon = async (couponId) => {
  const res = await apiInstance.delete(`/deleteCoupon/${couponId}`);
  return res;
};

export const updateCouponStatus = async (_id, status) => {
  const res = await apiInstance.put(`/updateCouponStatus/${_id}`, {
    status,
  });
  return res.data;
};

export const adminLogin = async (data) => {
  console.log(data, "kkkkkkkkkk");
  const res = await apiInstance.post(`/adminLogin`, data);
  return res;
};

export const allAdmin = async () => {
  const res = await apiInstance.get(`/allAdmin`);
  return res;
};

export const getUser = async () => {
  try {
    const resp = await apiInstance.get(`/getProfile`);
    return resp.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getoneUser = async () => {
  const res = await apiInstance.get("/getOneAdmin");
  return res;
};

export const updateUser = async (_id, data) => {
  return await apiInstance.put(`/editProfile`, data);
};

export const getAllShipping = async () => {
  const res = await apiInstance.get(`/getshipping`);
  return res;
};

export const createShipping = async (data) => {
  const res = await apiInstance.post(`/createshipping`, data, {});
  return res;
};

export const getAllContactUs = async () => {
  const res = await apiInstance.get(`/getcontactus`);
  return res;
};

export const createContactUs = async (data) => {
  const res = await apiInstance.post(`/createcontactus`, data, {});
  return res;
};

export const getAllAboutUs = async () => {
  const res = await apiInstance.get(`/getaboutus`);
  return res;
};

export const createAboutUs = async (data) => {
  const res = await apiInstance.post(`/createaboutus`, data, {});
  return res;
};

export const getPrivacyPolicy = async () => {
  const res = await apiInstance.get(`/getprivacypolicy`);
  return res;
};

export const createPrivacyPolicy = async (data) => {
  const res = await apiInstance.post(`/createprivacypolicy`, data, {});
  return res;
};

export const getAllTermsAndConduction = async () => {
  const res = await apiInstance.get(`/gettermsandcondition`);
  return res;
};

export const createTermsAndConduction = async (data) => {
  const res = await apiInstance.post(`/createtermsandcondition`, data, {});
  return res;
};

export const getAllReturnPolicy = async () => {
  const res = await apiInstance.get(`/getreturnpolicy`);
  return res;
};

export const createReturnPolicy = async (data) => {
  const res = await apiInstance.post(`/createreturnpolicy`, data, {});
  return res;
};

export const getAllShippingPolicy = async () => {
  const res = await apiInstance.get(`/getshippingpolicy`);
  return res;
};

export const createShippingPolicy = async (data) => {
  const res = await apiInstance.post(`/createshippingpolicy`, data, {});
  return res;
};

export const getDeliveryPolicy = async () => {
  const res = await apiInstance.get(`/getdeliverypolicy`);
  return res;
};

export const createDeliveryPolicy = async (data) => {
  const res = await apiInstance.post(`/createdeliverypolicy`, data, {});
  return res;
};

export const getAdminPolicy = async () => {
  const res = await apiInstance.get(`/getadminpolicy`);
  return res;
};

export const createAdminPolicy = async (data) => {
  const res = await apiInstance.post(`/createadminpolicy`, data, {});
  return res;
};

export const getSubCategory = async () => {
  const res = await apiInstance.get(`/getSubCategory`);
  return res;
};

export const getCategory = async () => {
  const res = await apiInstance.get(`/getAllCategory`);
  return res;
}; 

export const getActiveCategories = async () => {
  const res = await apiInstance.get(`/getActiveCategories`);
  return res;
}; 

export const getActiveSubcategories = async () => {
  const res = await apiInstance.get(`/getActiveSubcategories`);
  return res;
};

export const getUserQueries = async () => {
  try {
    const response = await apiInstance.get("/getUserQueries");
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user queries"
    );
  }
};

export const getWebSettings = async () => {
  const res = await apiInstance.get(`/getwebSettings`);
  return res;
};

export const getBanner = async () => {
  const res = await apiInstance.get(`/getBanner`);
  return res;
};

export const saveWebSettings = async (data) => {
  const res = await apiInstance.post(`/webSettings`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const getBannerCreate = async (data) => {
  const res = await apiInstance.post(`/createUpdateBanner`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const getBannerEdit = async (id, data) => {
  const res = await apiInstance.put(`/updateBanner?bannerId=${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const deleteBanner = async (id) => {
  console.log(id, "hahahoijf");
  const res = await apiInstance.delete(`/deleteBanner?bannerId=${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

// Get all FAQs
export const getFaq = async () => {
  const res = await apiInstance.get("/v1/admin/getFAQ");
  return res.data; // Assuming your API returns data directly
};

// Create new FAQ
export const createFaq = async (faqData) => {
  const res = await apiInstance.post("/v1/admin/createFAQ", faqData);
  return res.data;
};

export const deleteReviewsRatings = async (_id) => {
  const res = await apiInstance.delete(`/deleteReviewsRatings/${_id}`);
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await apiInstance.post(`/forgotPassword`, data);
  return res;
};

export const resendOtp = async (data) => {
  const res = await apiInstance.post(`/resendOtp`, data);
  return res;
};

export const verifyResetOtp = async (data) => {
  const res = await apiInstance.post(`/verifyResetOtp`, data);
  return res;
};

export const resetPassword = async (data) => {
  const res = await apiInstance.post(`/resetPassword`, data);
  return res;
};


// ➕ Create Topbar
export const createTopbarMessage = async (data) => {
  const res = await apiInstance.post("/createTopbar", data);
  return res;
};

// 📄 Get all topbars (Admin)
export const getTopbarMessages = async () => {
  const res = await apiInstance.get("/getTopbar");
  return res;
};

// 🌐 Get active topbar (User side)
export const getActiveTopbar = async () => {
  const res = await apiInstance.get("/getActiveTopbar");
  return res;
};

// ✏️ Update topbar
export const updateTopbar = async (id, data) => {
  const res = await apiInstance.put(`/updateTopbar/${id}`, data);
  return res;
};

// 🔁 Enable / Disable topbar
export const toggleTopbarMessage = async (id) => {
  const res = await apiInstance.patch(`/toggleTopbar/${id}`);
  return res;
};

// ❌ Delete topbar
export const deleteTopbarMessage = async (id) => {
  const res = await apiInstance.delete(`/deleteTopbar/${id}`);
  return res;
};


export const getTestimonial = async () => {
  const res = await apiInstance.get(`/getTest`);
  return res;
};


export const createTestimonial = async (data) => {
  const res = await apiInstance.post(`/createTest`, data, {
     headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};


export const updateTestimonial = async (id, data) => {
  const res = await apiInstance.put(`/updateTest/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};


export const deleteTestimonial = async (id) => {
  const res = await apiInstance.delete(`/deleteTest/${id}`);
  return res;
};


// Update existing FAQ
// export const updateFaq = async (id, faqData) => {
//   const res = await apiInstance.put(`/v1/admin/updateFAQ/${id}`, faqData);
//   return res.data;
// };

// Delete FAQ
// export const deleteFaq = async (id) => {
//   const res = await apiInstance.delete(`/v1/admin/deleteFAQ/${id}`);
//   return res.data;
// };
