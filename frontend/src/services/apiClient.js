import axios from 'axios';
import useAuthStore from '../store/authStore';


const API_URL = "https://4584-15-206-151-26.ngrok-free.app/api";

// create axios instance with some configurations
const apiClient = axios.create({
    baseURL: API_URL,
    headers:{
        "Content-Type": "application/json",
    }
});

// request interceptors for adding access-token to the header
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().getAccessToken();
        if (accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config
    },
    (error) => {
        
        Promise.reject(error)
    }
);

// response interceptors for handling token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // if error is 401 and we haven't already tried to refresh
        if(
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ){
            originalRequest._retry = true;

            try{
                // attemp to refresh the access token
                const refreshToken = useAuthStore.getState().getRefreshToken();
                console.log("refresj_token-STORED:", refreshToken)
                if (!refreshToken){
                    // no refresh token, redirect to login
                    return Promise.reject(error);
                }
                
                // call refresh endpoint
                const response = await axios.post(
                    `${API_URL}/refresh`,
                    {},
                    {
                        headers:{
                            Authorization: `Bearer ${refreshToken}`
                        },
                    }
                );
                console.log("refresh_response:",response)

                // update the token in the zustand state
                const { token } = response.data
                // also can do const token = response.data.token;
                useAuthStore.getState().setTokens(token, refreshToken);

                // update the auth header for the original request
                originalRequest.headers.Authorization = `Bearer ${token}`

                // retry the original request
                return apiClient(originalRequest);
            } catch(refreshError){
                // refreh failed, clear tokens and redirect to login
                useAuthStore.getState().clearAuth();
                console.log("cleared_AUTH")
     
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
);

export default apiClient;