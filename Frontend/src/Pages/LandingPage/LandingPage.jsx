import React, { useState, useEffect } from "react";

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#F8FAFC", // soft white
      paddingBottom: "100px",
    },
    titleSection: {
      position: "relative",
      marginTop: "250px",
      textAlign: "center",
    },
    image: (side) => ({
      position: "absolute",
      top: "0",
      [side]: `${scrollPosition}px`,
      width: "400px",
      transition: "left 0.2s ease, right 0.2s ease",
      zIndex: 0,
    }),
    titleBox: {
      padding: "40px 20px",
      border: "10px solid #0D9488",
      backgroundColor: "#F8FAFC",
      zIndex: 1,
      position: "relative",
    },
    titleText: {
      fontFamily: "Josefin Sans, sans-serif",
      color: "#0D9488",
      fontWeight: "700",
      fontSize: "5rem",
      margin: 0,
    },
    sectionHeader: {
      marginTop: "250px",
      fontFamily: "Oswald, sans-serif",
      backgroundColor: "#14B8A6",
      color: "#F8FAFC",
      fontSize: "3.5rem",
      fontWeight: 700,
      padding: "20px",
      width: "100%",
      textAlign: "center",
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleSection}>
        <img
          src="/assets/images/1.png"
          alt="Top Decoration"
          style={styles.image("left")}
        />
        <div style={styles.titleBox}>
          <h1 style={styles.titleText}>SKILL SWAP</h1>
        </div>
        <img
          src="/assets/images/2.png"
          alt="Bottom Decoration"
          style={styles.image("right")}
        />
      </div>

      <h2 style={styles.sectionHeader}>WHY SKILL SWAP?</h2>

      <div style={styles.textBlock}>
        At Skill Swap, we believe in the power of mutual learning and collaboration.
        Here's why Skill Swap is the ultimate platform for skill acquisition and knowledge exchange:
        <br /><br />

        <div style={styles.highlight}>➊ Learn From Experts:</div>
        Gain insights and practical knowledge directly from experienced mentors. Whether it's mastering a new programming language, honing your culinary skills, or diving into digital marketing — our mentors are here for you.
        <br /><br />

        <div style={styles.highlight}>➋ Share Your Expertise:</div>
        Have a skill you're passionate about? Become a mentor and share your knowledge with the community. Empower others while strengthening your own skills.
        <br /><br />

        <div style={styles.highlight}>➌ Collaborative Environment:</div>
        Connect with like-minded individuals, work on group projects, and engage in vibrant discussions. Skill Swap is built on mutual growth.
        <br /><br />

        <div style={styles.highlight}>➍ Diverse Learning Opportunities:</div>
        With Skill Swap, the possibilities are endless and <b>free of cost</b>. From traditional crafts to cutting-edge tech, find what interests you.
        <br /><br />

        <div style={styles.highlight}>➎ Continuous Growth:</div>
        Learning never stops. Whether you're a beginner or a pro, Skill Swap supports your journey of self-improvement and community contribution.
      </div>
    </div>
  );
};

export default LandingPage;
