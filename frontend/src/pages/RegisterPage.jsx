import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import useAuthStore from "../store/authStore";


const pageClasses =
  "min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden";

export default function RegisterPage() {
  const { isAuthenticated, authLoading, authError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className={pageClasses}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 ring-1 ring-gray-200 dark:ring-gray-700 space-y-6 z-10"

      >
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-gray-100" >
          Create an Account
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm" >
          Join us today and start collaborating with ease
        </p>

        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" >
            <p className="text-sm">{authError}</p>
          </div>
        )}

        {authLoading ? (
          <div className="flex justify-center" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <div className="h-12 w-12 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <RegisterForm />
        )}
      </div>
    </div>


  );
}
