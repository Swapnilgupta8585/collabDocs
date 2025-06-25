import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LandingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
      
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative overflow-hidden"

    >
      {/* Top Navigation */}
      <header
        className="bg-white/70 dark:bg-gray-800 backdrop-blur-lg shadow ring-1 ring-gray-200 dark:ring-gray-700"

      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1
            className="text-4xl font-black tracking-tight text-blue-600 dark:text-blue-400"

          >
            collab<span className="text-gray-900 dark:text-gray-100">Docs</span>
          </h1>
          <div className="flex items-center gap-4 " >
            <div className="hover:scale-110 transition shadow-lg" >
              <Link
                to="/login"
                className="text-base  px-3 py-2 sm:px-5 sm:py-2 rounded-full border font-semibold border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 "
              >
                Sign In
              </Link>
            </div>
            <div  className=" hover:scale-110 transition shadow-lg">
              <Link
                to="/register"
                className="text-base px-3 py-2 sm:px-5 sm:py-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 sm:px-10 md:px-16 ">
        <h2
          className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-6"

        >
          Collaborate in{' '}
          <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
            Real-Time
          </span>
        </h2>
        <p
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl"

        >
          collabDocs lets you create, share, and edit documents together—anywhere, anytime.
          Enjoy seamless collaboration with a beautiful, intuitive experience.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap p-2" >
          <div  className="px-2 py-4 sm:py-3  hover:scale-110 transition shadow-lg">
            <Link
              to="/register"
              className="px-8 py-3 text-lg font-medium rounded-full bg-blue-600 dark:bg-blue-500 text-white  hover:bg-blue-700 dark:hover:bg-blue-600 "
            >
              Get Started
            </Link>
          </div>
          <div   className=" px-2 py-4 sm:py-3  hover:scale-110 transition shadow-lg">
            <Link
              to="/login"
              className="px-8 py-3 text-lg font-medium rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 "
            >
              Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-6 text-center text-sm text-gray-500 dark:border-gray-700"

      >
        &copy; {new Date().getFullYear()} collabDocs. All rights reserved.
      </footer>
    </div>
  );
}