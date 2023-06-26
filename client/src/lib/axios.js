import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default instance;
