import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import instance from "../lib/axios";

export const fetchUser = createAsyncThunk("user/fetchUser", async (signal) => {
  let response = await instance.get("/user/checkLogged", {
    signal,
  });

  return response?.data?.data;
});

let userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser: (state, { payload }) => {
      return payload;
    },
  },
  extraReducers: (callback) => {
    callback.addCase(fetchUser.fulfilled, (state, { payload }) => {
      return payload;
    });
    callback.addCase(fetchUser.rejected, (state, { error }) => {
      if (error?.code === "ERR_CANCELED") {
        console.log("Cancelled");
      } else {
        return null;
      }
    });
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
