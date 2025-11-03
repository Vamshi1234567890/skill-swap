import React, { useState, useEffect } from "react";

const LandingPage = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      overflowX: "hidden",
    },
    hero: {
      width: "100%",
      textAlign: "right",
      marginTop: "100px",
      marginBottom: "80px",
      padding: "0 200px",
    },
    heroImage: {
      width: "40%",
      maxWidth: "800px",
      borderRadius: "12px",
      boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
    },
    sectionHeader: {
      fontFamily: "Oswald, sans-serif",
      backgroundColor: "#14B8A6",
      color: "#F8FAFC",
      fontSize: "3rem",
      fontWeight: 700,
      padding: "15px 0",
      width: "100%",
      textAlign: "center",
      marginTop: "100px",
      boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    },
    textBlock: {
      fontFamily: "Montserrat, sans-serif",
      fontSize: "1.1rem",
      color: "#1E293B",
      maxWidth: "1000px",
      margin: "60px 20px",
      lineHeight: "1.8",
      textAlign: "left",
    },
    highlight: {
      color: "#0D9488",
      fontWeight: "bold",
      marginTop: "20px",
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "25px",
      marginTop: "60px",
      padding: "0 40px",
      maxWidth: "1000px",
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      boxShadow: "0px 6px 15px rgba(0,0,0,0.08)",
      padding: "25px",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    cta: {
      backgroundColor: "#0D9488",
      color: "#F8FAFC",
      padding: "40px 20px",
      marginTop: "120px",
      width: "100%",
      textAlign: "center",
    },
    ctaBtn: {
      backgroundColor: "#F8FAFC",
      color: "#0D9488",
      border: "none",
      padding: "15px 40px",
      fontSize: "1.2rem",
      fontWeight: "600",
      borderRadius: "8px",
      marginTop: "20px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={styles.container}>
      {/* HERO IMAGE */}
      <div style={styles.hero}>
        <img src="/assets/images/3.png" alt="SkillSwap Team" style={styles.heroImage} />
      </div>

      {/* WHY SKILLSWAP */}
      <h2 style={styles.sectionHeader}>WHY SKILL SWAP?</h2>
      <div style={styles.textBlock}>
        At SkillSwap, we believe in the power of mutual learning and collaboration.
        <br />
        Here’s why SkillSwap is your go-to platform for learning and sharing skills:
        <div style={styles.highlight}>➊ Learn From Experts:</div>
        Gain knowledge directly from experienced mentors in any field.
        <div style={styles.highlight}>➋ Share Your Expertise:</div>
        Teach others what you love while growing your own mastery.
        <div style={styles.highlight}>➌ Build Real Connections:</div>
        Collaborate, grow, and learn with passionate people around you.
      </div>

      {/* HOW IT WORKS */}
      <h2 style={styles.sectionHeader}>HOW IT WORKS</h2>
      <div style={styles.featureGrid}>
        {[
          { step: "1️⃣", title: "Sign Up", text: "Create your free SkillSwap account in seconds." },
          { step: "2️⃣", title: "List Skills", text: "Offer what you know or request what you want to learn." },
          { step: "3️⃣", title: "Connect & Chat", text: "Find matches nearby and start chatting instantly." },
          { step: "4️⃣", title: "Exchange Skills", text: "Collaborate through chat or video call." },
        ].map((item, index) => (
          <div key={index} style={styles.card}>
            <h3 style={{ color: "#0D9488", marginBottom: "10px" }}>
              {item.step} {item.title}
            </h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <h2 style={styles.sectionHeader}>FEATURES</h2>
      <div style={styles.featureGrid}>
        {[
          { icon: "💬", title: "Real-Time Chat", text: "Instant communication with file sharing support." },
          { icon: "📁", title: "Multi-File Uploads", text: "Attach multiple files or documents with ease." },
          { icon: "📍", title: "Nearby Search", text: "Discover skill partners within your locality." },
          { icon: "🎥", title: "Video Calls", text: "Collaborate face-to-face through integrated calls." },
          { icon: "⚙️", title: "Dashboard", text: "Manage your skills, requests, and collaborations." },
        ].map((item, i) => (
          <div key={i} style={styles.card}>
            <h3 style={{ fontSize: "1.8rem" }}>{item.icon}</h3>
            <h4 style={{ color: "#0D9488" }}>{item.title}</h4>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={{ fontSize: "2rem", fontFamily: "Oswald, sans-serif", marginBottom: "10px" }}>
          Ready to Start Your Skill Journey?
        </h2>
        <p>Join SkillSwap today and discover how sharing skills can change your world.</p>
        <button
          style={styles.ctaBtn}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#0D9488";
            e.target.style.color = "#F8FAFC";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#F8FAFC";
            e.target.style.color = "#0D9488";
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
