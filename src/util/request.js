import axios from "axios";

/**
 * 自定义封装axios实例
 */
const request = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  timeout: 5000, // 超时时间
});

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    // 在请求发送之前做些什么
    // 可以在这里设置请求头等信息
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    return response.data;
  },
  (error) => {
    // 对响应错误做些什么
    return Promise.reject(error);
  }
);

export default request;
