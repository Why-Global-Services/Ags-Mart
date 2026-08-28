// store/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  editOrders,
  getOrders,
  getReviewRatingBasedOnProduct,
  addEditReviewRating,
} from '@/app/interceptor/interseptor';

// Initial State
const initialState = {
  orders: [],
  selectedOrder: null,
  selectedProduct: null,
  activeTab: 'all',
  showModal: false,
  modalType: null,
  cancelReason: '',
  cancelImage: null,
  isSubmitting: false,
  showReviewModal: false,
  userReview: null,
  reviewData: {
    rating: 0,
    reviewText: '',
    reviewImages: [],
  },
  isReviewSubmitting: false,
  imageError: '',
  returnType: 'return',
  error: null,
  loading: false,
};

// Async Thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrders();
      if (response.success) {
        return response.data || [];
      } else {
        return rejectWithValue(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProductReview = createAsyncThunk(
  'orders/fetchProductReview',
  async (product, { rejectWithValue }) => {
    try {
      const productId = product.products?.productId || product.productId;
      const variantId = product.products?.variantId || product.variantId;

      if (!productId) {
        console.error('No product ID found for review');
        return rejectWithValue('No product ID found');
      }

      const response = await getReviewRatingBasedOnProduct(productId, variantId);

      if (response && response.success) {
        if (response.productReview && response.productReview.length > 0) {
          const firstReview = response.productReview[0];
          return {
            userReview: response,
            reviewData: {
              rating: firstReview.rating || 0,
              reviewText: firstReview.review || '',
              reviewImages: firstReview.reviewImages || [],
            },
          };
        } else {
          return {
            userReview: null,
            reviewData: {
              rating: 0,
              reviewText: '',
              reviewImages: [],
            },
          };
        }
      }
      return rejectWithValue('Failed to fetch review');
    } catch (err) {
      console.error('Error fetching review:', err);
      return rejectWithValue(err.message);
    }
  }
);

export const handleRequest = createAsyncThunk(
  'orders/handleRequest',
  async (type, { getState, rejectWithValue }) => {
    const { orders } = getState();
    const { selectedOrder, selectedProduct, cancelReason, cancelImage } = orders;

    if (!selectedOrder || !cancelReason.trim()) {
      toast.error('Please provide a reason');
      return rejectWithValue('Please provide a reason');
    }

    try {
      const formData = new FormData();
      formData.append('reason', cancelReason);

      if (cancelImage instanceof File) {
        formData.append('returnImage', cancelImage);
      }

      // Determine if it's product-specific or whole order
      if (selectedProduct) {
        // Product-specific return
        formData.append('status', 'Return Request');
        formData.append('productId', selectedProduct.products.productId);

        if (selectedProduct.products.variantId) {
          formData.append('variantId', selectedProduct.products.variantId);
        }

        await editOrders(selectedOrder.orderId, formData);

        toast.success('Product return request submitted!');
        
        return {
          type: 'product',
          orderId: selectedOrder.orderId,
          productId: selectedProduct.products.productId,
          cancelReason,
        };
      } else {
        // Whole order return
        formData.append('status', 'Return Request');
        await editOrders(selectedOrder.orderId, formData);

        toast.success('Order return request submitted!');
        
        return {
          type: 'order',
          orderId: selectedOrder.orderId,
          cancelReason,
        };
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to submit ${type} request`
      );
      return rejectWithValue(error.response?.data?.message || 'Failed to submit request');
    }
  }
);

export const handleReviewSubmit = createAsyncThunk(
  'orders/handleReviewSubmit',
  async (_, { getState, rejectWithValue }) => {
    const { orders } = getState();
    const { reviewData, selectedProduct, userReview, selectedOrder } = orders;

    if (!reviewData.rating || reviewData.rating === 0) {
      toast.error('Please provide a rating');
      return rejectWithValue('Please provide a rating');
    }

    if (!reviewData.reviewText.trim()) {
      toast.error('Please write a review');
      return rejectWithValue('Please write a review');
    }

    try {
      const product = selectedProduct.products;
      const productId = product.productId;
      const variantId = product.variantId;

      if (!productId) {
        toast.error('Product information is missing');
        return rejectWithValue('Product information is missing');
      }

      const formData = new FormData();
      formData.append('rating', reviewData.rating);
      formData.append('review', reviewData.reviewText);

      const existingImages = reviewData.reviewImages.filter(
        (img) => typeof img === 'string'
      );
      const newImages = reviewData.reviewImages.filter(
        (img) => img instanceof File || img instanceof Blob
      );

      existingImages.forEach((url, index) => {
        formData.append(`existingImageUrls[${index}]`, url);
      });

      newImages.forEach((image) => {
        formData.append(`reviewImages`, image);
      });

      const response = await addEditReviewRating(productId, variantId, formData);
      console.log(response, 'this is the response');

      if (response.success) {
        toast.success(
          userReview ? 'Review updated successfully!' : 'Review submitted successfully!'
        );

        return {
          orderId: selectedOrder._id,
          productId,
          reviewData: {
            rating: reviewData.rating,
            reviewText: reviewData.reviewText,
            reviewImages: reviewData.reviewImages || [],
          },
          response,
        };
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Failed to submit review');
      return rejectWithValue(error.message || 'Failed to submit review');
    }
  }
);

// Orders Slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setReturnType: (state, action) => {
      state.returnType = action.payload;
    },
    setImageError: (state, action) => {
      state.imageError = action.payload;
    },
    setReviewData: (state, action) => {
      state.reviewData = action.payload;
    },
    setUserReview: (state, action) => {
      state.userReview = action.payload;
    },
    setShowReviewModal: (state, action) => {
      state.showReviewModal = action.payload;
    },
    setIsReviewSubmitting: (state, action) => {
      state.isReviewSubmitting = action.payload;
    },
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setModalType: (state, action) => {
      state.modalType = action.payload;
    },
    setCancelReason: (state, action) => {
      state.cancelReason = action.payload;
    },
    setCancelImage: (state, action) => {
      state.cancelImage = action.payload;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    openModal: (state, action) => {
      state.modalType = action.payload;
      state.showModal = true;
      state.cancelReason = '';
      state.cancelImage = null;
    },
    openReviewModal: (state, action) => {
      state.selectedProduct = action.payload;
      state.showReviewModal = true;
    },
    handleModalCancel: (state) => {
      state.showModal = false;
      state.modalType = null;
      state.cancelReason = '';
      state.cancelImage = null;
    },
    handleReviewModalCancel: (state) => {
      // Revoke object URLs for File objects
      state.reviewData.reviewImages.forEach((img) => {
        if (img instanceof File && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      state.showReviewModal = false;
      state.reviewData = { rating: 0, reviewText: '', reviewImages: [] };
      state.userReview = null;
      state.imageError = '';
      state.selectedProduct = null;
    },
    handleImageUpload: (state, action) => {
      state.cancelImage = action.payload;
    },
    handleRemoveImage: (state) => {
      state.cancelImage = null;
    },
    handleReviewImageUpload: (state, action) => {
      const file = action.payload;

      if (!file.type || !file.type.startsWith('image/')) {
        state.imageError = 'Only image files are allowed';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        state.imageError = 'Image size exceeds 2 MB';
        return;
      }

      file.preview = URL.createObjectURL(file);

      state.reviewData.reviewImages = [...state.reviewData.reviewImages, file];
      state.imageError = '';
    },
    handleReviewImageRemove: (state, action) => {
      const file = action.payload;
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      state.reviewData.reviewImages = state.reviewData.reviewImages.filter(
        (img) => img !== file
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = [];
      });

    // Fetch Product Review
    builder
      .addCase(fetchProductReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductReview.fulfilled, (state, action) => {
        state.loading = false;
        state.userReview = action.payload.userReview;
        state.reviewData = action.payload.reviewData;
      })
      .addCase(fetchProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle Request (Cancel/Return)
    builder
      .addCase(handleRequest.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(handleRequest.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { type, orderId, productId, cancelReason } = action.payload;

        if (type === 'product') {
          // Update product-specific return
          state.orders = state.orders.map((order) => {
            if (order.orderId === orderId) {
              return {
                ...order,
                orderDetails: order.orderDetails.map((detail) => {
                  if (detail.products.productId === productId) {
                    return {
                      ...detail,
                      products: {
                        ...detail.products,
                        orderStatus: 'Return Request',
                        returnReason: cancelReason,
                      },
                    };
                  }
                  return detail;
                }),
              };
            }
            return order;
          });

          if (state.selectedOrder && state.selectedOrder.orderId === orderId) {
            state.selectedOrder = {
              ...state.selectedOrder,
              orderDetails: state.selectedOrder.orderDetails.map((detail) => {
                if (detail.products.productId === productId) {
                  return {
                    ...detail,
                    products: {
                      ...detail.products,
                      orderStatus: 'Return Request',
                      returnReason: cancelReason,
                    },
                  };
                }
                return detail;
              }),
            };
          }
        } else {
          // Update whole order return
          state.orders = state.orders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderStatus: 'Return Request', reason: cancelReason }
              : order
          );

          if (state.selectedOrder && state.selectedOrder.orderId === orderId) {
            state.selectedOrder = {
              ...state.selectedOrder,
              orderStatus: 'Return Request',
              reason: cancelReason,
            };
          }
        }

        state.showModal = false;
        state.cancelReason = '';
        state.cancelImage = null;
      })
      .addCase(handleRequest.rejected, (state) => {
        state.isSubmitting = false;
      });

    // Handle Review Submit
    builder
      .addCase(handleReviewSubmit.pending, (state) => {
        state.isReviewSubmitting = true;
        state.imageError = '';
      })
      .addCase(handleReviewSubmit.fulfilled, (state, action) => {
        state.isReviewSubmitting = false;
        const { orderId, productId, reviewData, response } = action.payload;

        state.orders = state.orders.map((order) => {
          if (order._id === orderId) {
            return {
              ...order,
              orderDetails: order.orderDetails.map((detail) => {
                if (detail.products.productId === productId) {
                  return {
                    ...detail,
                    review: {
                      rating: reviewData.rating,
                      reviewText: reviewData.reviewText,
                      reviewImages: reviewData.reviewImages || [],
                    },
                  };
                }
                return detail;
              }),
            };
          }
          return order;
        });

        state.showReviewModal = false;
        state.reviewData = { rating: 0, reviewText: '', reviewImages: [] };
        state.userReview = response;
        state.imageError = '';
      })
      .addCase(handleReviewSubmit.rejected, (state) => {
        state.isReviewSubmitting = false;
      });
  },
});

export const {
  setOrders,
  setSelectedOrder,
  setSelectedProduct,
  setActiveTab,
  setReturnType,
  setImageError,
  setReviewData,
  setUserReview,
  setShowReviewModal,
  setIsReviewSubmitting,
  setShowModal,
  setModalType,
  setCancelReason,
  setCancelImage,
  setIsSubmitting,
  openModal,
  openReviewModal,
  handleModalCancel,
  handleReviewModalCancel,
  handleImageUpload,
  handleRemoveImage,
  handleReviewImageUpload,
  handleReviewImageRemove,
} = ordersSlice.actions;

export default ordersSlice.reducer;