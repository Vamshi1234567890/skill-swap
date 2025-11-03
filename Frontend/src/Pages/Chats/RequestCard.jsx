import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
// 1. Import the new card correctly
import IncomingRequestCard from "../../Components/IncomingRequestCard/IncomingRequestCard.jsx"; 
// Assuming this is your requests-specific CSS file


// NOTE: Define your backend URL if you are not using a proxy/default setting
// const YOUR_BACKEND_URL = "http://localhost:5000"; 

const RequestsPage = () => {
    // State to hold the incoming requests
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH INCOMING REQUESTS ---
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                // 🛑 Ensure this API route exists and populates senderID
                const { data } = await axios.get(`/request/incoming`); 
                setRequests(data.data); 
            } catch (error) {
                toast.error(error?.response?.data?.message || "Failed to fetch requests.");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // --- ACCEPT HANDLER ---
    const handleAccept = async (requestID, senderName) => {
        try {
            // 🛑 Ensure this API route exists and works (PUT /request/accept/:requestID)
            const { data } = await axios.put(`/request/accept/${requestID}`);
            
            toast.success(data.message || `Connected with ${senderName}!`);

            // Filter out the accepted request to update the UI
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestID));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to accept request.");
        }
    };

    // --- REJECT HANDLER ---
    const handleReject = async (requestID) => {
        try {
            // 🛑 Ensure this API route exists and works (PUT /request/reject/:requestID)
            const { data } = await axios.put(`/request/reject/${requestID}`);
            
            toast.info(data.message || "Request rejected.");

            // Filter out the rejected request to update the UI
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestID));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to reject request.");
        }
    };


    if (loading) {
        return (
            <div className="text-center p-5" style={{ minHeight: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }
    
    // Check for empty or malformed requests to prevent map errors
    const validRequests = Array.isArray(requests) ? requests : [];

    return (
        <div className="container py-5">
            <h1 className="mb-4" style={{ color: '#007BFF' }}>👥 Connection Requests ({validRequests.length})</h1>
            
            <div className="requests-list">
                {validRequests.length === 0 ? (
                    <p className="text-muted">You have no pending connection requests.</p>
                ) : (
                    validRequests.map(request => (
                        // ⚠️ Conditional rendering here ensures request.senderID is checked
                        // If senderID is NOT populated by the backend, this map will fail.
                        request.senderID && (
                            <IncomingRequestCard
                                key={request._id}
                                requestID={request._id}
                                picture={request.senderID.picture}
                                name={request.senderID.name}
                                username={request.senderID.username}
                                bio={request.senderID.bio}
                                rating={request.senderID.rating || 5}
                                skills={request.senderID.skillsProficientAt || []}
                                onAccept={handleAccept} 
                                onReject={handleReject} 
                            />
                        )
                    ))
                )}
            </div>
        </div>
    );
};

export default RequestsPage;