/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import authService from "../services/authService";
import useAuthStore from "../store/authStore";

const fieldVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const containerClasses =
  "bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 ring-1 ring-gray-200 dark:ring-gray-700";
const inputClasses =
  "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500";
const buttonClasses =
  "w-full py-3 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-medium shadow hover:bg-blue-700 dark:hover:bg-blue-600 transition transform hover:scale-105 cursor-pointer";

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

    //  validate password match 
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
    } catch (err) {
      setAuthError(
        typeof err === "string" ? err : "Registration failed. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

   const handleNavigateToLogin = () => {
        setAuthError(null);
    };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      className="w-full max-w-md"
    >
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
            Create Account
          </motion.h2>
        </div>

        <motion.div variants={fieldVariants}>
          <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
          />
        </motion.div>

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
            className={inputClasses}
          />
        </motion.div>

        <motion.div variants={fieldVariants}>
          <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            minLength="6"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClasses}
          />
          {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
        </motion.div>

        <motion.div variants={fieldVariants}>
          <button type="submit" className={buttonClasses}> 
            Sign Up
          </button>
        </motion.div>

        <motion.div className="text-center text-sm text-gray-600 dark:text-gray-400" variants={fieldVariants}>
          Already have an account?{' '}
          <Link onClick={handleNavigateToLogin} to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}