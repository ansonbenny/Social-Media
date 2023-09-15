import { createSlice } from "@reduxjs/toolkit";

const additionalSlice = createSlice({
  name: "additional",
  initialState: {
    loading: true,
    notification: null,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
      return state;
    },
    setNotification: (state, { payload }) => {
      if (payload) {
        state.notification = {
          url: payload?.url,
          name: payload?.name,
        };
      } else {
        state.notification = null;
      }

      return state;
    },
  },
});

export const { setLoading, setNotification } = additionalSlice.actions;

export default additionalSlice.reducer;
