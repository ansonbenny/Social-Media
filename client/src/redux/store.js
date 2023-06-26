import { configureStore } from "@reduxjs/toolkit";
import user from "./user";

export default configureStore({
  reducer: user,
});
