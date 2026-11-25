import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdminProfile } from "../interceptor/interseptor";

/* ================= FETCH PROFILE ================= */

const DEFAULT_ADMIN_WHATSAPP = "919789676031";

export const fetchAdminProfile = createAsyncThunk(
  "adminProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAdminProfile();

      const rawNumber = res?.data?.mobileNumber ? String(res.data.mobileNumber).replace(/\D/g, "") : "";
      const isDummyOrOldNumber =
        !rawNumber ||
        rawNumber.includes("9876543210") ||
        rawNumber.includes("9344430739");

      const contactNumber = isDummyOrOldNumber
        ? DEFAULT_ADMIN_WHATSAPP
        : rawNumber.startsWith("91") && rawNumber.length === 12
        ? rawNumber
        : rawNumber.length === 10
        ? `91${rawNumber}`
        : DEFAULT_ADMIN_WHATSAPP;

      return {
        primaryEmail: res?.data?.email || "",
        secondaryEmail: res?.data?.additionalEmail || "",
        contactNumber,
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
    contactNumber: DEFAULT_ADMIN_WHATSAPP,
    address: "",

    loading: false,
    error: null,
  },

  reducers: {
    resetAdminProfile: (state) => {
      state.primaryEmail = "";
      state.secondaryEmail = "";
      state.contactNumber = DEFAULT_ADMIN_WHATSAPP;
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
