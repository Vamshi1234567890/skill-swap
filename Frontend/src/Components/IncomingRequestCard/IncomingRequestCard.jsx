import React, { useState } from "react";
// ✅ FIX: Corrected CSS path - adjust this path if your Card.css is elsewhere!
import "../../Pages/Discover/Card.css"; 
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const IncomingRequestCard = ({
    requestID,
    picture,
    bio,
    name,
    skills,
    rating,
    username,
    onAccept, 
    onReject, 
}) => {
    const [actionLoading, setActionLoading] = useState(false);

    const handleAction = async (handler) => {
        setActionLoading(true);
        try {
            // Passes the request ID and name to the parent handler
            await handler(requestID, name); 
        } catch (error) {
            // Note: Parent component (RequestsPage) handles the toast/error message
        } finally {
            setActionLoading(false);
        }
    };

    const isButtonDisabled = actionLoading;

    return (
        <div className="card-container">
            <img className="img-container" src={picture} alt={`${name}'s profile`} />
            <h3>{name}</h3>
            <h6>Rating : {rating}</h6>
            <p>{bio}</p>
            
            {/* Action Buttons for Request */}
            <div className="prof-buttons request-actions">
                <button
                    onClick={() => handleAction(onAccept)}
                    disabled={isButtonDisabled}
                    style={{ 
                        backgroundColor: '#28a745', 
                        borderColor: '#28a745', 
                        color: 'white', 
                        padding: '10px 20px', 
                        marginRight: '10px', 
                        borderRadius: '4px' 
                    }}
                >
                    {actionLoading ? (
                        <Spinner animation="border" size="sm" variant="light" />
                    ) : (
                        "Accept"
                    )}
                </button>
                
                <button
                    onClick={() => handleAction(onReject)}
                    disabled={isButtonDisabled}
                    style={{ 
                        backgroundColor: 'transparent', 
                        border: '1px solid #dc3545', 
                        color: '#dc3545', 
                        padding: '10px 20px', 
                        borderRadius: '4px' 
                    }}
                >
                    {actionLoading ? (
                        <Spinner animation="border" size="sm" variant="danger" />
                    ) : (
                        "Reject"
                    )}
                </button>
            </div>
            
            {/* View Profile Button */}
            <div className="prof-buttons" style={{ marginTop: '10px' }}>
                <Link to={`/profile/${username}`}>
                    <button className="primary ghost">View Profile</button>
                </Link>
            </div>
            
            <div className="profskills">
                <h6>Skills</h6>
                <div className="profskill-boxes">
                    {skills.map((skill, index) => (
                        <div key={index} className="profskill-box">
                            <span className="skill">{skill}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IncomingRequestCard;