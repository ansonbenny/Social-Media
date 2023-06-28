import { createSlice } from "@reduxjs/toolkit";

const additionalSlice = createSlice({
  name: "additional",
  initialState: {
    loading: true,
    menu: false,
  },
  reducers: {
    setLoading: (state, { payload }) => {
      state.loading = payload;
      return state;
    },
    setMenu: (state, { payload }) => {
      state.menu = payload;
      return state;
    },
  },
});

export const { setLoading, setMenu } = additionalSlice.actions;

export default additionalSlice.reducer;
