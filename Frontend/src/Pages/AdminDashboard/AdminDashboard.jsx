// ./Pages/AdminDashboard/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Use your existing toast notification

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'; // Replace with your actual server URL variable

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Get the token from wherever you store it (e.g., localStorage)
            const token = localStorage.getItem('accessToken'); 

            if (!token) {
                toast.error("Authentication required for Admin access.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${SERVER_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                withCredentials: true // Important for cookies/session handling
            });

            setUsers(response.data.users);
            setLoading(false);

        } catch (error) {
            console.error("Admin fetch error:", error);
            // Display the specific error message from the backend (like "Admin privileges required.")
            toast.error(error.response?.data?.message || "Failed to load admin data.");
            setLoading(false);
        }
    };
    
    // Handler for banning/deleting a user
    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to DELETE user: ${username}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`${SERVER_URL}/admin/user/toggleBan/${userId}`, {}, { // Using PUT for consistency with the backend example
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                withCredentials: true
            });

            toast.success(`User ${username} successfully deleted!`);
            fetchUsers(); // Refresh the list

        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.response?.data?.message || "Failed to delete user.");
        }
    };

    if (loading) return <div className="p-8 text-center text-xl">Loading Admin Dashboard...</div>;

    return (
        <div className="admin-dashboard container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Control Panel</h1>
            <p className="mb-4">Total Users: <span className="font-semibold">{users.length}</span></p>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="py-2 px-4 text-left">Username</th>
                            <th className="py-2 px-4 text-left">Email</th>
                            <th className="py-2 px-4 text-left">Is Admin</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{user.username}</td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4">{user.isAdmin ? 'Yes' : 'No'}</td>
                                <td className="py-2 px-4">
                                    <button 
                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;