import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore';


export default function ProtectedRoute(){
    const {user, isAuthenticated} = useAuthStore()

    // if user is not logged in or there's no valid token, redirect to login page
    if (!user || !isAuthenticated) {
        return <Navigate to="/login" replace/>
    }

    // Otherwise, render the child routes
    return <Outlet />;

}