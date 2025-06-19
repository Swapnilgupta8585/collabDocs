import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import  authService from "../services/authService";
import  useAuthStore  from "../store/authStore"


export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const { setUser, setAuthLoading, setAuthError } = useAuthStore();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // validate password match 
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        setPasswordError("");
        setAuthLoading(true);
        setAuthError(null);

        try {
            const userData = await authService.register(name, email, password);
            setUser(userData);
            navigate("/login");
        } catch (error) {
            setAuthError(
                typeof error === "string" ? error : "Registration failed. Please try again."
            );
        } finally {
            setAuthLoading(false);
        }
    };

    const handleNavigateToLogin = () => {
        setAuthError(null);
    };

    return (
        <>
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4"
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                        Create Account
                    </h2>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-medium mb-2"
                            htmlFor="name"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Your Full Name"
                            required
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            className="border shadow-sm rounded w-full  py-2 px-3 text-gray-700 appearance-none leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 font-medium text-sm mb-2"
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
                            className="border shadow-sm w-full py-2 px-3 text-gray-700 appearance-none rounded leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            minLength="6"
                            required
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            className="border w-full shadow-sm py-2 px-3 text-gray-700 leading-tight rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            className="text-sm font-medium text-gray-700 block mb-2"
                            htmlFor="confirmPassword"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            required
                            minLength="6"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                            }}
                            className="shadow-sm rounded w-full py-2 px-3 leading-tight border text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {passwordError && (
                            <p className="text-red-500 text-xs italic mt-1">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-center">
                        <button className="cursor-pointer rounded w-full border bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 font-medium focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
                            Sign Up
                        </button>
                    </div>

                    <div className="text-center mt-2">
                        <span className="text-gray-600 text-sm">
                            Already have an account?{" "}
                        </span>
                        <Link
                            to="/login"
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            onClick={handleNavigateToLogin}
                        >
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </>
    )
}


