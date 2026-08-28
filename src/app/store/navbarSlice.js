// src/app/store/navbarSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getNavbarData } from "../interceptor/interseptor";

// ================= FETCH =================
export const fetchNavbarData = createAsyncThunk(
  "navbar/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getNavbarData();
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ================= SLICE =================
const navbarSlice = createSlice({
  name: "navbar",

  initialState: {
    categories: [],
    cartSize: 0,
    wishlistSize: 0,
    isAuthenticated: false,

    loading: false,
    error: null,
  },

  reducers: {
    setCartSize: (state, action) => {
      state.cartSize = action.payload;
    },

    setWishlistSize: (state, action) => {
      state.wishlistSize = action.payload;
    },

    resetNavbar: (state) => {
      state.categories = [];
      state.cartSize = 0;
      state.wishlistSize = 0;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchNavbarData.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchNavbarData.fulfilled, (state, action) => {
        const raw = action.payload?.data?.findCategory || [];

        state.categories = raw.map((cat) => ({
          _id: cat._id,
          categoryTitle: cat.categoryTitle,
          subCategories: cat.subCategory || [],
        }));

        state.isAuthenticated = !!action.payload?.isAuthenticated;

        state.loading = false;
      })

      .addCase(fetchNavbarData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCartSize,
  setWishlistSize,
  resetNavbar,
} = navbarSlice.actions;

export default navbarSlice.reducer;
