import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Badge } from "react-bootstrap";
import { FaStar } from "react-icons/fa";

const ProfileCard = ({ profileImageUrl, bio, name, skills, rating, username }) => {
  const [isHovered, setIsHovered] = useState(false);

  // --- Theme Colors ---
  const primaryButtonColor = "#3498db"; 
  const highlightColor = "#f39c12"; 
  const textColor = "#333333";

  // --- Inline Styles ---
  const cardStyle = {
    width: "280px",
    border: `1px solid rgba(0, 0, 0, 0.1)`,
    borderRadius: "12px",
    boxShadow: isHovered ? "0 6px 18px rgba(0, 0, 0, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.05)",
    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    textAlign: "center",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
  };

  const nameStyle = { fontSize: "1.4rem", fontWeight: "600", color: textColor, marginBottom: "5px", };
  const bioStyle = { fontSize: "0.9rem", color: "#666666", marginBottom: "20px", height: "40px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.3em", };

  const finalRating = typeof rating === 'number' ? rating : 
                      (typeof rating === 'string' && !isNaN(parseFloat(rating)) ? parseFloat(rating) : 5);

  return (
    <Card 
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <Card.Img variant="top" src={profileImageUrl} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "15px", border: `3px solid ${primaryButtonColor}`, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", }} />
      <Card.Body style={{ padding: "0", width: "100%" }}>
        <Card.Title style={nameStyle}>{name}</Card.Title>
        
        <Card.Text style={{ fontSize: "0.95rem", color: "#666666", marginBottom: "15px", display: "flex", justifyContent: 'center', alignItems: "center", gap: "5px", }}>
            {Array.from({ length: 5 }, (_, i) => (<FaStar key={i} color={i < finalRating ? highlightColor : "#e0e0e0"} size={14} />))}
            <span style={{ color: textColor, fontWeight: '600', marginLeft: '5px' }}>{finalRating.toFixed(1)}</span>
        </Card.Text>
        
        <Card.Text style={bioStyle}>{bio || "No bio provided."}</Card.Text>

        <Link to={`/profile/${username}`} style={{ textDecoration: 'none', width: '100%' }}>
          <Button variant="primary" style={{ backgroundColor: primaryButtonColor, borderColor: primaryButtonColor, borderRadius: '8px', padding: '10px 20px', width: '100%', marginTop: '15px' }}>
            View Profile
          </Button>
        </Link>

        {skills && skills.length > 0 && (
          <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: `1px solid rgba(0, 0, 0, 0.1)`, width: "100%", textAlign: "left", }}>
            <h6 style={{ fontSize: "0.9rem", fontWeight: "600", color: textColor, marginBottom: "10px" }}>Skills</h6>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
              {skills.slice(0, 5).map((skill, index) => (
                <Badge key={index} style={{ margin: "4px", padding: "6px 10px", borderRadius: "20px", backgroundColor: "#e8f0f4", color: "#4a7698", fontWeight: "500", fontSize: "0.8rem", display: 'inline-block', }}>
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;