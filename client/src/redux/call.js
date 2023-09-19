import { createSlice } from "@reduxjs/toolkit";

const callSlice = createSlice({
    name: "call",
    initialState: null,
    reducers: {
        addCall: (state, { payload }) => {
            return payload
        },
        addAttend: (state, { payload }) => {
            return { ...state, attend: true }
        },
        addEnded: (state, { payload }) => {
            return { ...state, ended: true }
        },
    }
})

export const { addCall, addAttend, addEnded } = callSlice.actions;
export default callSlice.reducer;