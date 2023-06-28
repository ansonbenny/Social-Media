import { configureStore } from "@reduxjs/toolkit";
import user from "./user";
import additional from "./additional";

export default configureStore({
  reducer: { user, additional },
});
