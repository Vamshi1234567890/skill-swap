import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// FINAL FIX: Path corrected to reference a sibling file in the same 'util' directory.
import { useUser } from './UserContext.jsx'; 

const AdminRoutes = () => {
    // 1. Get user data from your actual context hook
    const { user } = useUser();
    
    // NOTE: This simple check assumes the context has finished its initial load
    // and resolved the user/null status from localStorage.

    // 2. Determine authentication and admin status.
    const isAuthenticated = !!user;
    
    // Assuming the user object has an isAdmin flag
    const isAdmin = user?.isAdmin === true; 
    
    // === Routing Logic ===

    if (!isAuthenticated) {
        // If not logged in, redirect to login
        // Your context does this, but this is a necessary safeguard here.
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // If logged in but NOT an admin, redirect to home (403 forbidden)
        return <Navigate to="/" replace />;
    }

    // If authenticated and an admin, render the nested route
    return <Outlet />;
};

export default AdminRoutes;
