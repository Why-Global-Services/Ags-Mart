import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdminProfile } from "../interceptor/interseptor";

/* ================= FETCH PROFILE ================= */

export const fetchAdminProfile = createAsyncThunk(
  "adminProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAdminProfile();

      return {
        primaryEmail: res?.data?.email || "",
        secondaryEmail: res?.data?.additionalEmail || "",
        contactNumber: res?.data?.mobileNumber || "",
        address: res?.data?.Address || "",
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ================= SLICE ================= */

const adminProfileSlice = createSlice({
  name: "adminProfile",

  initialState: {
    primaryEmail: "",
    secondaryEmail: "",
    contactNumber: "",
    address: "",

    loading: false,
    error: null,
  },

  reducers: {
    resetAdminProfile: (state) => {
      state.primaryEmail = "";
      state.secondaryEmail = "";
      state.contactNumber = "";
      state.address = "";
    },
  },

  extraReducers: (builder) => {
    builder

      /* Fetch */

      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.loading = false;

        state.primaryEmail = action.payload.primaryEmail;
        state.secondaryEmail = action.payload.secondaryEmail;
        state.contactNumber = action.payload.contactNumber;
        state.address = action.payload.address;
      })

      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminProfile } = adminProfileSlice.actions;

export default adminProfileSlice.reducer;
