import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getHome } from "../interceptor/interseptor";

// Async API call
export const fetchHomeData = createAsyncThunk(
  "home/fetchHomeData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getHome();
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  homeData: {
    navbarDatas: null,
    middleBannerDatas: null,
    topBannerDatas: null,
    bottomBannerDatas: null,
    brandsData: null,
    allBrandsData: null,
    bestOfferProductsData: null,
    bestSellingProductsData: null,
    getAllProductsGroupedByCategory: null,
    newProductsData: null,
    getCouponsData: null,
    categories: null,
    cart: null,
    wishlist: null,
    luxuryCollection: null,
    justForYouData: null,
    getTetimonialData: null,
  },

  loading: false,
  error: null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,

  reducers: {
    resetHomeData: (state) => {
      state.homeData = initialState.homeData;
      state.loading = false;
      state.error = null;
    },

    updateHomeData: (state, action) => {
      const { key, value } = action.payload;
      state.homeData[key] = value;
    },
  },

  extraReducers: (builder) => {
    builder

      // Loading
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Success
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        const res = action.payload;

        state.homeData = {
          navbarDatas: res.navbarDatas?.data || null,
          middleBannerDatas: res.middleBannerDatas || null,
          topBannerDatas: res.topBannerDatas || null,
          bottomBannerDatas: res.bottomBannerDatas || null,
          brandsData: res.brandsData || null,
          allBrandsData: res.allBrandsData || null,
          getAllProductsGroupedByCategory: res.getAllProductsGroupedByCategory || null,
          bestOfferProductsData: res.bestOfferProductsData || null,
          bestSellingProductsData: res.bestSellingProductsData || null,
          newProductsData: res.newProductsData || null,
          getCouponsData: res.getCouponsData || null,
          categories: res.allCategory?.data || null,
          cart: res.cart || null,
          wishlist: res.wishlist || null,
          luxuryCollection: res.luxuryCollection || null,
          justForYouData: res.justForYou || null,
          getTetimonialData: res.getTetimonial?.data || null,
          todaysDealsData: res.todaySpecialProducts || null,
        };

        state.loading = false;
      })

      // Error
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetHomeData, updateHomeData } = homeSlice.actions;

export default homeSlice.reducer;
