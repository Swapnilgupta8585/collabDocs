/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import authService from "../services/authService";
import useAuthStore from "../store/authStore";


// Variants for staggered field animations
const fieldVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

// Shared styles
const containerClasses =
  "bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ring-1 ring-gray-200 dark:ring-gray-700";
const inputClasses =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
const buttonClasses =
  "w-full py-3 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-medium shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition transform hover:scale-105 cursor-pointer";

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
      const { user, token, refresh_token } = await authService.login(email, password);
      setTokens(token, refresh_token);
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(typeof err === "string" ? err : "Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

   const handleNavigateToLogin = () => {
        setAuthError(null);
    };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={containerClasses + " space-y-6"}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="flex justify-between items-center">
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          variants={fieldVariants}
        >
          Sign In
        </motion.h2>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
        
        </button>
      </div>

      <motion.div variants={fieldVariants}>
        <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          minLength="6"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses + " mb-4"}
        />
      </motion.div>


      {/* WILL ADD THIS FEATURE SOMETIMES LATER
       <motion.div variants={fieldVariants} className="text-right">
        <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
          Forgot your password?
        </Link>
      </motion.div> */}

      <motion.div variants={fieldVariants}>
        <button type="submit" className={buttonClasses}>
          Sign In
        </button>
      </motion.div>


      <motion.div
        className="text-center text-sm text-gray-600 dark:text-gray-400"
        variants={fieldVariants}
      >
        Don’t have an account?{" "}
        <Link onClick={handleNavigateToLogin} to="/register" className="text-blue-500 hover:text-blue-700 font-medium">
          Sign Up
        </Link>
      </motion.div>
    </motion.form>
  );
}
