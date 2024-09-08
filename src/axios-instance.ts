import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.SERVER_BASE_URL,
  timeout: 20000,
});

export { axiosInstance };
