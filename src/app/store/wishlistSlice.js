// src/app/store/wishlistSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWishlist,
  addtoWishlist,
  removeUpdateWishlist,
} from "../interceptor/interseptor";

import { setWishlistSize } from "./navbarSlice";

// ================= FETCH =================
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await getWishlist();

      const items = res?.data || [];

      dispatch(setWishlistSize(items.length));

      return items;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


/* ================= ADD ================= */

export const addWishlistItem = createAsyncThunk(
  "wishlist/add",

  async (
    { productId, variantId, productType, variantType },
    { dispatch, rejectWithValue }
  ) => {
    try {
        console.log(productId, variantId,"this is the ids");
      await addtoWishlist(productId, variantId, productType, variantType);

      // Refresh wishlist
      dispatch(fetchWishlist());

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ================= REMOVE ================= */

export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",

  async (
    { productId, variantId, productType, variantType },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await removeUpdateWishlist(
        productId,
        variantId,
        productType,
        variantType
      );

      // Refresh wishlist
      dispatch(fetchWishlist());

      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// ================= SLICE =================
const wishlistSlice = createSlice({
  name: "wishlist",

  initialState: {
    wishlistItems: [],
    loading: false,
    error: null,
  },

  reducers: {
    resetWishlist: (state) => {
      state.wishlistItems = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload;
        state.loading = false;
      })

      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
