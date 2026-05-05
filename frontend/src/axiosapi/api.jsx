import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173',//бек адресс хз какой порт
  withCredentials: true
});
api.interceptors.request.use((config) => {
const token = localStorage.getItem('access_token')
  if(token){
     config.headers.Authorization = `Bearer ${token}`;
  }else{
    console.log ('ошибка получения токена')
  }
  return config
})
// Обработка 401 ошибки (истек токен)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Запрос на обновление токена
        const res = await axios.post(`http://localhost:5173/api/v1/refresh`, {},
        { withCredentials: true });
        const { accessToken } = res.data;
        localStorage.setItem('access_token', accessToken);
        
        // Повторяем исходный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Если refresh token устарел -> logout
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;