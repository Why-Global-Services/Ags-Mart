// store/webSettingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWebSettings } from '../interceptor/interseptor';

// Initial State
const initialState = {
  logo: '',
  loading: false,
  error: null,
};

// Async Thunk
export const fetchWebSettings = createAsyncThunk(
  'webSettings/fetchWebSettings',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔥 Redux: fetchWebSettings called');
      const response = await getWebSettings();
      console.log('WEB SETTINGS RESPONSE 👉', response);

      return {
        logo: response?.data?.UserSettings[0]?.userLogo || '',
      };
    } catch (error) {
      console.error('Failed to fetch web settings:', error);
      return rejectWithValue(error.message || 'Failed to fetch web settings');
    }
  }
);

// Web Settings Slice
const webSettingsSlice = createSlice({
  name: 'webSettings',
  initialState,
  reducers: {
    // Sync actions if needed
    setLogo: (state, action) => {
      state.logo = action.payload;
    },
    clearWebSettings: (state) => {
      state.logo = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.logo = action.payload.logo;
        state.error = null;
      })
      .addCase(fetchWebSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setLogo,
  clearWebSettings,
} = webSettingsSlice.actions;

export default webSettingsSlice.reducer;