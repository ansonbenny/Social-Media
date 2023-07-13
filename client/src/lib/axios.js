import axios_lib from "axios";

const axios = axios_lib.create({
  baseURL: "/api",
  withCredentials: true,
});

export default axios;
