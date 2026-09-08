import axios from "axios";

const apiInstance = axios.create({
  baseURL:
  //  "http://localhost:5001/v1/user",
   "https://agsmartapi.whydev.in/v1/user"
});

// ✅ Public routes that don't need token
const publicRoutes = ["/user/register", "/user/login"];

// ✅ Request Interceptor
apiInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("token");

      // Only add token if it's not a public route
      if (authToken && !publicRoutes.includes(config.url)) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor
apiInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiInstance;

export const Register = async (data) => {
  console.log(data);
  const res = await apiInstance.post(`/register`, data);
  return res;
};

export const Login = async (data) => {
  const res = await apiInstance.post(`/login`, data);
  return res;
};

export const getWebSettings = async () => {
  const res = await apiInstance.get(`/getWebSettings`);
  return res;
};

export const getHome = async () => {
  try {
    const response = await apiInstance.get("/getHomePageAllData");
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch cart");
  }
};

export const getNavbarData = async () => {
  const res = await apiInstance.get(`/getNavbar`);
  return res;
};

export const Otp = async (data) => {
  const res = await apiInstance.post(`/otp`, data);
  return res;
};

export const OtpVerify = async (data) => {
  const res = await apiInstance.post(`/otpVerify`, data);
  return res;
};

export const ForgotPassword = async (data) => {
  const res = await apiInstance.post(`/forgot-password`, data);
  return res;
};

export const VerifyResetOtp = async (data) => {
  const res = await apiInstance.post(`/verify-reset-otp`, data);
  return res;
};

export const ResetPassword = async (data) => {
  const res = await apiInstance.post(`/reset-password`, data);
  return res;
};

export const getAboutUs = async () => {
  const res = await apiInstance.get(`/getAboutUs`);
  return res;
};

// export const addAddressToCart = async (billingAddress) => {
//   console.log( billingAddress, "addressdata")
//   const res = await apiInstance.post(`/addAddressToCart`, billingAddress);
//   return res;
// };

export const addAddressToCart = async (deliveryAddress, billingAddress) => {
  const body = {
    deliveryAddress,
    billingAddress,
  };
  const res = await apiInstance.post(`/addAddressToCart`, body);
  return res;
};


export const getUserBasedCoupon = async () => {
  const res = await apiInstance.get(`/getUserBasedCoupon`)
  return res;
}


export const verifyCoupon = async (couponCode) => {
  const body = {couponCode};

  console.log(body, 'coupon code verify')

  const res = await apiInstance.post(`/coupon`, body)
  return res;
}


export const placeOrder  = async (payload) => {
  const res = await apiInstance.post(`/placeOrder`,payload)
  return res.data
}


// export const Orders = async (data) => {
//   console.log(data, "this is to cjeck for coupons");
//   const res = await apiInstance.post(`/placeOrder`, data);
//   return res;
// };

export const Paymentverification = async (orderId, response) => {
  const res = await apiInstance.post(`/verifyPayment/${orderId}`, response);
  return res;

};

export const PayPalPaymentVerfication = async (data, orderId) => {
  const res = await apiInstance.post(`/verifyPaypal`, data);
};

export const stripePaymentVerification = async (sessionId) => {
  const res = await apiInstance.post(
    `/verifyStripePayment?session_id=${sessionId}`
  );
  return res;
};

export const TermsAndCondition = async () => {
  const res = await apiInstance.get(`/gettermsandcondition`);
  console.log("terms", res.data);
  return res.data;
};

export const getContactUs = async () => {
  const res = await apiInstance.get(`/getcontactus`);
  return res;
};

export const createUserQuery = async (data) => {
  const res = await apiInstance.post(`/createUserQuery`, data);
  return res;
};

export const getReturnpolicy = async () => {
  const response = await apiInstance.get(`/getreturnpolicy`);
  console.log("Return", response.data);
  return response.data;
};

export const getShippingPolicy = async () => {
  const res = await apiInstance.get(`/getshippingpolicy`);
  console.log("Shipping", res.data);
  return res.data;
};

export const getPrivacyPolicy = async () => {
  const res = await apiInstance.get(`/getprivacypolicy`);
  console.log("Privacy", res.data);
  return res.data;
};

export const getDeliveryPolicy = async () => {
  const res = await apiInstance.get(`/getdeliverypolicy`);
  console.log("API Full Response:", res);
  return res;
};

export const getAdminPolicy = async () => {
  const res = await apiInstance.get(`/getadminpolicy`);
  return res;
};

export const getFAQ = async () => {
  const res = await apiInstance.get(`/getFAQ`);
  return res;
};

export const postAddress = async (formattedData) => {
  const res = await apiInstance.post(`/addAddress`, { formattedData });
  return res;
};

export const getAddress = async () => {
  const res = await apiInstance.get(`/getAddress`);
  return res;
};

export const updateAddress = async (formattedData) => {
  const res = await apiInstance.post(`/updateAddress`, { formattedData });
  return res;
};

export const googleLogin = async ({ token }) => {
  const res = await apiInstance.post("/google", { token });
  return res;
};

export const Search = async (searchQuery) => {
  const res = await apiInstance.get(
    `/search?query=${encodeURIComponent(searchQuery)}`
  );
  return res;
};

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
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to edit address");
  }
};

export const addToCart = async ({
  productId,
  variantId,
  variantType,
  quantity,
}) => {
  const guestId = localStorage.getItem("guestId");

  try {
    const response = await apiInstance.post(
      `/cart?productId=${productId}&variantId=${variantId}`,
      { quantity, variantType }, // The backend resolves the selected variant by ID.
      {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      }
    );

    return { ...response.data, success: true };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add item to cart"
    );
  }
};


export const getCart = async () => {
    const guestId = localStorage.getItem("guestId");
  try {
    const response = await apiInstance.get("/getCart",
       {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch cart");
  }
};

export const editCartData = async (productId, variantId, { quantity }) => {
   const guestId = localStorage.getItem("guestId");
  try {
    const response = await apiInstance.post(
      `/cart?productId=${productId}&variantId=${variantId}`,
      { quantity },
       {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update cart");
  }
};

export const removeFromCart = async (variantId) => {
   const guestId = localStorage.getItem("guestId");
   console.log("first", variantId, guestId)
  try {
    const response = await apiInstance.put(
      `/editCartData?variantId=${variantId}`,{},
     {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to remove item from cart"
    );
  }
};

export const addtoWishlist = async (productId, variantId) => {
  const guestId = localStorage.getItem("guestId");

  console.log(productId, variantId,"this is the ids");
  const res = await apiInstance.post(
    `/wishlist?productId=${productId}&variantId=${variantId}`,
    {},
     {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      }
  );
  return res;
};

export const getWishlist = async () => {
    const guestId = localStorage.getItem("guestId");
  const res = await apiInstance.get(`/getWishlist`, {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      });
  return res;
};

export const getCheckout = async () => {
  const res = await apiInstance.get(`/getCheckout`);
  return res.data;
};

export const removeUpdateWishlist = async (productId, variantId) => {
    const guestId = localStorage.getItem("guestId");
  console.log(productId, variantId,"this is the ids");
  
  return await apiInstance.put(
    `/updateWishlistData?productId=${productId}&variantId=${variantId}`,
    {},
    {
        headers: {
          guestid: guestId, // 👈 HEADERS
        },
      }
  );
};

export const deleteWishlist = async (productId, variantId) => {
  const res = await apiInstance.delete(
    `/deleteWishlist?productId=${productId}&variantId=${variantId}`
  );
  return res;
};

export const getProductDetails = async (_id, token) => {
  const res = await apiInstance.get(`/Products/${_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};

export const addAddress = async (addressData) => {
  try {
    const response = await apiInstance.post(`/address`, addressData);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add address");
  }
};

export const editAddress = async (addressId, updatedData) => {
  try {
    const response = await apiInstance.put(
      `/editaddress/${addressId}`,
      updatedData
    );
    console.log(response, "edit address");

    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to edit address");
  }
};

export const getAddresses = async () => {
  try {
    const response = await apiInstance.get(`/getaddress`);
    console.log("Anna Response", response);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch addresses"
    );
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await apiInstance.delete(`/deleteAddress/${addressId}`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete address"
    );
  }
};

export const getUserDetails = async () => {
  try {
    const response = await apiInstance.get(`/getDetails`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch addresses"
    );
  }
};

export const updateUserDetails = async (data) => {
  try {
    const response = await apiInstance.put(`/editDetails`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to edit address");
  }
};

export const GetDashboardData = async (signal) => {
  try {
    const response = await apiInstance.get("/dashboard", { signal });
    return response.data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request aborted");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch dashboard data"
    );
  }
};

export const getOrders = async () => {
  try {
    const response = await apiInstance.get(`/getOrders`);
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch addresses"
    );
  }
};

export const editOrders = async (orderId, data) => {
  try {
    const response = await apiInstance.put(`/editOrder/${orderId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to edit address");
  }
};

  export const getReviewRatingBasedOnProduct = async (variantId) => {
    try {
      const response = await apiInstance.get(
        `/getReviewRatingBasedOnProduct?variantId=${variantId}`
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
  };

    export const getAdminProfile = async () => {
    try {
      const response = await apiInstance.get(
        `/getProfile`
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch Admin Profile"
      );
    }
  };

      export const getActiveTopbar = async () => {
    try {
      const response = await apiInstance.get(
        `/getActiveTopbar`
      );
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch Admin Profile"
      );
    }
  };


  export const SearchAPI = {
  // Search by keyword/category
  search: async (keyword) => {
    try {
      const response = await apiInstance.get(`/search?query=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      console.error("Search API error:", error);
      throw new Error(error.response?.data?.message || "Failed to search products");
    }
  },

  // Search by price
  searchByPrice: async (price) => {
    try {
      const response = await apiInstance.get(`/search?maxPrice=${price}`);
      return response.data;
    } catch (error) {
      console.error("Price search API error:", error);
      throw new Error(error.response?.data?.message || "Failed to search products by price");
    }
  },

  // Search with multiple filters
  searchWithFilters: async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          queryParams.append(key, value);
        }
      });

      const response = await apiInstance.get(`/search?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Filter search API error:", error);
      throw new Error(error.response?.data?.message || "Failed to search products with filters");
    }
  },

  // Search by category only
  searchByCategory: async (category) => {
    try {
      const response = await apiInstance.get(`/search?category=${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error("Category search API error:", error);
      throw new Error(error.response?.data?.message || "Failed to search products by category");
    }
  },

  // Get new arrivals
  getNewArrivals: async () => {
    try {
      const response = await apiInstance.get("/search?query=new");
      return response.data;
    } catch (error) {
      console.error("New arrivals API error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch new arrivals");
    }
  }
};


// GuestId  Genarater

export const createUserId = async (id) => {
  const res = await apiInstance.get(`/idGenerator`);
  return res;
};



// merge Cart 

export const mergeCart = async () => {
  const guestId = localStorage.getItem("guestId");
  const token = localStorage.getItem("token")

  if (!guestId) return;

  return apiInstance.post(
    "/mergeCart",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        guestid: guestId,
      },
    }
  );
};


// merge WishList

export const mergeWishlist = async () => {
  const guestId = localStorage.getItem("guestId");
  const token = localStorage.getItem("token");

  if (!guestId || !token) return;

  return apiInstance.post(
    "/mergeWish",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        guestid: guestId,
      },
    }
  );
};







// export const addEditReviewRating = async (productId, variantId, reviewData) => {
//   try {
//     const formData = new FormData();
//     formData.append("review", reviewData.reviewText);
//     formData.append("rating", reviewData.rating);
//     // Append multiple review images
//     if (reviewData.images && reviewData.images.length > 0) {
//       for (let i = 0; i < reviewData.images.length; i++) {
//         const blob = await fetch(reviewData.images[i]).then((res) => res.blob());
//         formData.append("reviewImages", blob, `reviewImage-${i}.jpeg`);
//       }
//     }

//     const response = await apiInstance.post(
//       `/addEditReviewRating?productId=${productId}&variantId=${variantId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.message || "Failed to add/edit review"
//     );
//   }
// };
