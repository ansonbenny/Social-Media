import { configureStore } from "@reduxjs/toolkit";
import user from "./user";
import additional from "./additional";
import call from "./call";

export default configureStore({
  reducer: { user, additional, call },
});
