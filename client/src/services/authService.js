import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
});

export const registerUser = async (userData) => {
  const response = await API.post("/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await API.post("/login", userData);
  return response.data;
};