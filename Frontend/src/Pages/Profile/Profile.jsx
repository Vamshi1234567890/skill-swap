import React, { useEffect, useState } from "react";
import "./Profile.css";
import Box from "./Box";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import { toast } from "react-toastify";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:8000/user/registered/getDetails/${username}`);
        setProfileUser(data.data);
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.message) {
          toast.error(error.response.data.message);
          if (error.response.data.message === "Please Login") {
            localStorage.removeItem("userInfo");
            setUser(null);
            await axios.get("http://localhost:8000/auth/logout");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [username]);

  const convertDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const connectHandler = async () => {
    try {
      setConnectLoading(true);
      const { data } = await axios.post(`http://localhost:8000/request/create`, {
        receiverID: profileUser._id,
      });
      toast.success(data.message);
      setProfileUser((prev) => ({ ...prev, status: "Pending" }));
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("http://localhost:8000/auth/logout");
          navigate("/login");
        }
      }
    } finally {
      setConnectLoading(false);
    }
  };

  return (
    <div
      className="profile-container"
      style={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        color: "#2c3e50",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="container" style={{ minHeight: "86vh", paddingTop: "40px" }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {/* Main Profile Header */}
            <div
              className="profile-box"
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "14px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                marginBottom: "30px",
              }}
            >
              <div className="left-div" style={{ display: "flex", alignItems: "center" }}>
                <div className="profile-photo" style={{ marginRight: "1.5rem" }}>
                  <img
                    src={profileUser?.picture || "/assets/images/user-placeholder.png"}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #007BFF",
                    }}
                  />
                </div>

                <div className="misc">
                  <h1
                    className="profile-name"
                    style={{
                      color: "#1a1a1a",
                      fontWeight: "700",
                      fontSize: "2rem",
                      marginBottom: "8px",
                    }}
                  >
                    {profileUser?.name}
                  </h1>

                  {/* Rating */}
                  <div className="rating" style={{ marginBottom: "10px" }}>
                    <span style={{ color: "#FFD700", fontSize: "18px" }}>
                      {Array.from({ length: profileUser?.rating || 5 }).map((_, i) => "★")}
                    </span>
                    <span style={{ color: "#555", marginLeft: "6px", fontWeight: "600" }}>
                      {profileUser?.rating || "5.0"}
                    </span>
                  </div>

                  {/* Buttons */}
                  {user?.username !== username && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        onClick={profileUser?.status === "Connect" ? connectHandler : undefined}
                        disabled={connectLoading}
                        style={{
                          backgroundColor: profileUser?.status === "Connect" ? "#007BFF" : "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px 18px",
                          fontWeight: "600",
                          cursor: "pointer",
                          flex: 1,
                        }}
                      >
                        {connectLoading ? <Spinner animation="border" variant="light" size="sm" /> : profileUser?.status}
                      </button>

                      <Link to={`/report/${profileUser.username}`}>
                        <button
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 18px",
                            fontWeight: "600",
                            flex: 1,
                            cursor: "pointer",
                          }}
                        >
                          Report
                        </button>
                      </Link>

                      <Link to={`/rating/${profileUser.username}`}>
                        <button
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 18px",
                            fontWeight: "600",
                            flex: 1,
                            cursor: "pointer",
                          }}
                        >
                          Rate
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit & Social Links */}
              <div className="edit-links" style={{ marginTop: "20px" }}>
                {user.username === username && (
                  <Link to="/edit_profile">
                    <button
                      style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      ✎ Edit Profile
                    </button>
                  </Link>
                )}

                <div style={{ marginTop: "15px" }}>
                  {["github", "linkedin", "portfolio"].map((type) => {
                    const link = profileUser?.[`${type}Link`];
                    return (
                      <a
                        key={type}
                        href={link || "#"}
                        target={link ? "_blank" : "_self"}
                        style={{ marginRight: "10px", opacity: link ? 1 : 0.5 }}
                      >
                        <img
                          src={`/assets/images/${type === "portfolio" ? "link" : type}.png`}
                          alt={type}
                          style={{ width: "30px", height: "30px" }}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bio */}
            <section>
              <h2 style={{ color: "#007BFF", fontWeight: "700", marginBottom: "10px" }}>Bio</h2>
              <p style={{ color: "#444", fontSize: "16px", lineHeight: "1.6" }}>
                {profileUser?.bio || "No bio available."}
              </p>
            </section>

            {/* Skills */}
            <section>
              <h2 style={{ color: "#007BFF", fontWeight: "700", margin: "25px 0 10px" }}>Skills Proficient At</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {profileUser?.skillsProficientAt?.length > 0 ? (
                  profileUser.skillsProficientAt.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: "#E8F0FE",
                        color: "#0056b3",
                        padding: "8px 15px",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "15px",
                        border: "1px solid #cce5ff",
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ color: "#777" }}>No skills added yet.</p>
                )}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 style={{ color: "#007BFF", fontWeight: "700", margin: "25px 0 10px" }}>Education</h2>
              {profileUser?.education?.length ? (
                profileUser.education.map((edu, i) => (
                  <Box
                    key={i}
                    head={edu?.institution}
                    date={`${convertDate(edu?.startDate)} - ${convertDate(edu?.endDate)}`}
                    spec={edu?.degree}
                    desc={edu?.description}
                    score={edu?.score}
                  />
                ))
              ) : (
                <p style={{ color: "#777" }}>No education details available.</p>
              )}
            </section>

            {/* Projects */}
            {profileUser?.projects?.length > 0 && (
              <section>
                <h2 style={{ color: "#007BFF", fontWeight: "700", margin: "25px 0 10px" }}>Projects</h2>
                {profileUser.projects.map((project, i) => (
                  <Box
                    key={i}
                    head={project?.title}
                    date={`${convertDate(project?.startDate)} - ${convertDate(project?.endDate)}`}
                    desc={project?.description}
                    skills={project?.techStack}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
