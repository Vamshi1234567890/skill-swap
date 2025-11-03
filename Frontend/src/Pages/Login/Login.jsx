import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const [isHovered, setIsHovered] = useState(false); // State for hover effect

  const handleGoogleLogin = () => {
    // In a real application, you'd navigate to your backend for Google OAuth
    window.location.href = "http://localhost:8000/auth/google";
  };

  // --- Styles for a Modern and Clean UI ---

  const containerStyle = {
    // Soft, subtle gradient background for a modern look
    background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
    minHeight: "90.4vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const loginCardStyle = {
    // A clean, elevated card for the login form
    backgroundColor: "#ffffff",
    padding: "40px 50px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)", // Soft, deep shadow
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: "400px",
    width: "100%",
    gap: "30px", // Spacing between elements
  };

  const titleStyle = {
    // Clean, dark title
    fontSize: "2.5rem",
    fontWeight: "600",
    fontFamily: "Arial, sans-serif",
    color: "#333333",
    marginBottom: "10px",
  };

  const subtitleStyle = {
    // Subtext for context
    fontSize: "1rem",
    color: "#777777",
    marginBottom: "20px",
    textAlign: "center",
  };

  const googleButtonStyle = {
    // Prominent, branded Google button
    backgroundColor: "#4285F4", // Google Blue
    color: "#fff",
    fontFamily: "Roboto, sans-serif",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.1rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "background-color 0.3s ease, transform 0.1s ease",
    width: "100%", // Full width of the card
    justifyContent: "center",
  };

  const googleButtonHoverStyle = {
    // Darker blue on hover
    backgroundColor: "#357ae8",
    transform: "translateY(-1px)", // Subtle lift effect
  };

  const finalButtonStyle = {
    ...googleButtonStyle,
    ...(isHovered ? googleButtonHoverStyle : {}),
  };

  return (
    <div style={containerStyle}>
      <div style={loginCardStyle}>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>
          Sign in to SkillSwap to continue learning and trading skills.
        </p>
        <Button
          style={finalButtonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleGoogleLogin}
        >
          <FaGoogle style={{ fontSize: "1.2rem" }} /> Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;