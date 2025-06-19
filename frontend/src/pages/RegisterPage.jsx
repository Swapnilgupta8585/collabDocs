import { Navigate, useNavigate } from 'react-router-dom';
import RegisterForm from "../components/RegisterForm";
import useAuthStore from '../store/authStore';
import { useEffect } from 'react';

export default function RegisterPage() {
    const { isAuthenticated, authLoading, authError } = useAuthStore()
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-3xl font-extrabold text-center text-gray-900">
                        Create an Account
                    </h1>
                    <p className="mt-2 text-sm text-center text-gray-600">
                        Join us today and start collaborating
                    </p>
                </div>

                <div className="mt-8 max-auto sm:w-full sm:max-w-md">
                    {authError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
                            <p className="text-sm">{authError}</p>
                        </div>
                    )}

                    {authLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <RegisterForm />
                    )}
                </div>
            </div>
        </>
    );
}