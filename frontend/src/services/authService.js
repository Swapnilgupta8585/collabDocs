import axios from "axios";
import useAuthStore from "../store/authStore";

const API_URL = "https://6680-15-206-151-26.ngrok-free.app/api";

const authService = {
    async register(full_name, email, password) {
        try {
            const response = await axios.post(`${API_URL}/users`, {
                full_name,
                email,
                password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            );
        }
    },

    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            return response.data
        } catch (error) {
            console.error("Login error:", error);
            throw new Error(
                error.response?.data?.error || error.message || "Something went wrong"
            );
        }
    },

    logout() {
        try {
            useAuthStore.getState().clearAuth();
            return true
        } catch (error) {
            console.error("Logout error:", error);
            return false
        }
    }
};

export default authService;
