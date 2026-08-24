import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

export const register = (data) => {
  return axios.post(`${BASE_URL}/register`, data);
};

export const login = (data) => {
  return axios.post(`${BASE_URL}/login`, data);
};