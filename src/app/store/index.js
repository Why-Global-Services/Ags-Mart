// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './ordersSlice';
import adminProfileReducer from './adminProfileSlice';
import webSettingsReducer from './webSettingsSlice';
import homeReducer from './homeSlice';
import navbarReducer from './navbarSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    adminProfile: adminProfileReducer,
    webSettings: webSettingsReducer,
    home: homeReducer,
    navbar: navbarReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['orders/setReviewData', 'orders/setCancelImage', 'orders/handleReviewImageUpload'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.cancelImage', 'payload.reviewData.reviewImages'],
        // Ignore these paths in the state
        ignoredPaths: ['orders.cancelImage', 'orders.reviewData.reviewImages'],
      },
    }),
});

export default store;