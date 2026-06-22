import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

/* ============================================
   1. Request Interceptor → tự gắn Bearer token
===============================================*/
axiosInstance.interceptors.request.use((config) => {
    // Kiểm tra môi trường browser trước khi truy cập localStorage
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

/* ===========================================================
   2. Refresh Token Logic → giữ cực đơn giản, không vòng lặp
==============================================================*/

let isRefreshing = false;
let waitingRequests: ((token: string) => void)[] = [];

/* Hàm chạy lại request cũ */
const retryFailedRequests = (newToken: string) => {
    waitingRequests.forEach((cb) => cb(newToken));
    waitingRequests = [];
};

axiosInstance.interceptors.response.use(
    (res) => res,

    async (error) => {
        const originalRequest = error.config;

        // Token hết hạn -> cần refresh
        const isExpired = error.response?.status === 401;

        // Không refresh cho login/register/refresh/change-password....
        const url = originalRequest.url || "";
        const isAuthAPI = 
            url.includes("/auth/login") || 
            url.includes("/auth/register") || 
            url.includes("/auth/refresh") ||
            url.includes("/auth/change-password");

        if (isExpired && !originalRequest._retry && !isAuthAPI) {
            originalRequest._retry = true;

            /* Nếu đang refresh → đợi */
            if (isRefreshing) {
                return new Promise((resolve) => {
                    waitingRequests.push((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                if (typeof window === "undefined") {
                    throw new Error("SSR: Cannot refresh token in server-side");
                }

                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) {
                    throw new Error("No refresh token found");
                }

                // Sử dụng API_URL đã khai báo
                const refreshRes = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                const { accessToken } = refreshRes.data;

                localStorage.setItem("auth_token", accessToken);
                retryFailedRequests(accessToken);

                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                isRefreshing = false;
                if (typeof window !== "undefined") {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    },
);
