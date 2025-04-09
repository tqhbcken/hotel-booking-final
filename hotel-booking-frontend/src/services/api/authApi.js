import axiosClient from "./axiosClient";

const authApi = {
  login: (credentials) => {
    return axiosClient.post("/auth/login", credentials);
  },
  logout: () => {
    return axiosClient.post("/auth/logout");
  },
  getProfile: () => {
    return axiosClient.get("/auth/profile");
  },
  refreshToken: (refreshToken) => {
    return axiosClient.post("/auth/refresh", { refreshToken });
  },
};

export default authApi;