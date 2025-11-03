import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  // --- Updated: Cleaner, slightly lighter dark background color ---
  const bgColor = "#96a1acff"; // Dark Slate Blue/Gray (A classic, clean dark color)
  const textColor = "#ecf0f1"; // Light Off-White
  const highlightColor = "#4682b4"; // Steel Blue for highlights

  const linkStyle = {
    color: textColor,
    textDecoration: "none",
    margin: "0 10px",
    fontSize: "0.95rem",
    transition: "color 0.3s ease",
  };

  const socialIconStyle = {
    color: textColor,
    fontSize: "1.5rem",
    margin: "0 10px",
    transition: "color 0.3s ease",
    cursor: "pointer",
  };

  return (
    <footer style={{ backgroundColor: bgColor, padding: "30px 0", marginTop: "auto" }}>
      <Container>
        {/* Main Content Row */}
        <Row className="text-center" style={{ color: textColor }}>
          <Col md={12}>
            {/* Logo/Brand Name */}
            <h5
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "1.5rem",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              SkillSwap
            </h5>
            
            {/* Quick Links */}
            <div className="mb-3">
              <a href="#about" style={linkStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}>
                About Us
              </a>
              <a href="#services" style={linkStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}>
                Services
              </a>
              <a href="#faq" style={linkStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}>
                FAQ
              </a>
              <a href="#contact" style={linkStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}>
                Contact
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="mb-4">
              <FaFacebook style={socialIconStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}/>
              <FaTwitter style={socialIconStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}/>
              <FaInstagram style={socialIconStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}/>
              <FaLinkedin style={socialIconStyle} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}/>
            </div>
            
          </Col>
        </Row>
        
        {/* Divider */}
        <hr style={{ borderColor: "rgba(255, 255, 255, 0.2)", margin: "20px auto" }} />

        {/* Copyright Row */}
        <Row className="text-center">
          <Col>
            <p
              className="mb-0"
              style={{
                fontFamily: "Montserrat, sans-serif",
                color: textColor,
                fontSize: "0.85rem",
              }}
            >
              Copyright &copy; 2025 SkillSwap. All rights reserved. |{" "}
              <a href="#privacy" style={{ ...linkStyle, margin: 0, textDecoration: "underline" }} onMouseEnter={(e) => (e.target.style.color = highlightColor)} onMouseLeave={(e) => (e.target.style.color = textColor)}>Privacy Policy</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;