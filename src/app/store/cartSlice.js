// src/app/store/cartSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart, addToCart, removeFromCart } from "../interceptor/interseptor";
import { setCartSize } from "./navbarSlice";

// ================= FETCH =================
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await getCart();

      const items = res?.items || [];

      // Sync navbar
      dispatch(setCartSize(items.length));

      return items;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


/* ================= ADD ================= */

export const addCartItem = createAsyncThunk(
  "cart/add",
  async ({ productId, variantId, productType, quantity }, { dispatch }) => {
    await addToCart({ productId, variantId, productType, quantity });

    // reload cart
    dispatch(fetchCart());
  }
);

/* ================= REMOVE ================= */

export const removeCartItem = createAsyncThunk(
  "cart/remove",
  async ({ productId, variantId, productType }, { dispatch }) => {
    await removeFromCart(variantId);

    dispatch(fetchCart());
  }
);

// ================= SLICE =================
const cartSlice = createSlice({
  name: "cart",

  initialState: {
    cartItems: [],
    loading: false,
    error: null,
  },

  reducers: {
    resetCart: (state) => {
      state.cartItems = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.loading = false;
      })

      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;

export default cartSlice.reducer;
