import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LandingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
            collab<span className="text-black">Docs</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm  transition-shadow hover:scale-105 hover:shadow-md hover:bg-blue-50 hover:text-blue-600"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition shadow-md hover:shadow-lg hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Collaborate in Real-Time.
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          collabDocs lets you create, share, and edit documents together—anywhere, anytime.
        </p>
        <div className="flex gap-4 ">
          <Link
            to="/register"
            className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-shadow hover:scale-105 hover:shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-800  transition-shadow hover:scale-105 hover:shadow-md hover:bg-blue-50 hover:text-blue-600"
          >
            Login
          </Link>
        </div>
      </main>

      {/* Footer (optional) */}
      <footer className="py-4 text-center text-sm text-gray-500">
        &copy; collabDocs. All rights reserved.
      </footer>
    </div>
  );
}


