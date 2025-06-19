import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService  from "../services/authService";
import useAuthStore from "../store/authStore";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setUser, setAuthLoading, setAuthError, setTokens } = useAuthStore();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        try {
            const userData = await authService.login( email, password);

            // Destructure everything from API response
            const { user, token, refresh_token } = userData;

            setTokens(token, refresh_token);

            setUser(user);
            navigate("/dashboard");
        } catch (error) {
            setAuthError(
                typeof error === "string" ? error : "Login failed. Please try again."
            );
        } finally {
            setAuthLoading(false);
        }
    };

    const handleNavigateToRegister = () => {
        setAuthError(null);
    }

    return (
        <>
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded-lg px-8 pb-8 pt-6 mb-4"
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                        Sign in
                    </h2>

                    <div className="mb-4">
                        <label
                            className="text-sm text-gray-700 font-medium mb-2 block"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            className="py-2 px-3 border leading-tight rounded w-full shadow-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-sm text-gray-700 font-medium mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            required
                            minLength="6"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            className="py-2 px-3 border leading-tight rounded w-full shadow-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex justify-center items-center mb-6">
                        <div>
                            <Link
                                to="/register"
                                className="cursor-pointer text-blue-500 hover:text-blue-700"
                            >
                                Forgot your password
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <button className="w-full bg-blue-500 hover:bg-blue-700 rounded px-4 py-2 text-white font-medium focus:outline-none focus:shadow-outline transition duration-150 cursor-pointer ease-in-out">
                            Sign in
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <span className="text-gray-700 text-sm">
                            Don't have an account?{" "}
                        </span>
                        <Link
                            className="text-blue-500 hover:text-blue-700 cursor-pointer font-medium text-sm"
                            to="/register"
                            onClick={handleNavigateToRegister}
                        >
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

