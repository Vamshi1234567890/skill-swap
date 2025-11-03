import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import ProfileCard from "./ProfileCard";
import "./Discover.css";

const Discover = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [webDevUsers, setWebDevUsers] = useState([]);
  const [mlUsers, setMlUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/user/registered/getDetails`);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Failed to load user");
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    };

    const getDiscoverUsers = async () => {
      try {
        const { data } = await axios.get("/user/discover");

        setDiscoverUsers(data.data.forYou);
        setWebDevUsers(data.data.webDev);
        setMlUsers(data.data.ml);
        setOtherUsers(data.data.others);

        const combinedUsers = [
          ...data.data.forYou,
          ...data.data.webDev,
          ...data.data.ml,
          ...data.data.others,
        ];
        const uniqueUsers = Array.from(
          new Map(combinedUsers.map((item) => [item.username, item])).values()
        );
        setAllUsers(uniqueUsers);
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Failed to fetch users");
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
    getDiscoverUsers();
  }, [navigate, setUser]);

  const filteredUsers = allUsers.filter((user) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return false;

    const nameMatch = user?.name?.toLowerCase().includes(term);
    const usernameMatch = user?.username?.toLowerCase().includes(term);
    const bioMatch = user?.bio?.toLowerCase().includes(term);
    const skillsMatch = user?.skillsProficientAt?.some((skill) =>
      skill.toLowerCase().includes(term)
    );

    return nameMatch || usernameMatch || bioMatch || skillsMatch;
  });

  const isSearching = searchTerm.trim().length > 0;

  const renderProfileCards = (users) => {
    if (!users || users.length === 0) {
      return <h1 style={{ color: "#ffd88a" }}>No users to show</h1>;
    }
    return users.map((user) => (
      <ProfileCard
        key={user?.username}
        profileImageUrl={user?.picture}
        name={user?.name}
        rating={user?.rating ? user?.rating : 5}
        bio={user?.bio}
        skills={user?.skillsProficientAt}
        username={user?.username}
      />
    ));
  };

  return (
    <div
      className="discover-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#1f2937",
        paddingBottom: "40px",
      }}
    >
      <div className="content-container">
        <div className="nav-bar">
          <Navbar
            expand="lg"
            className="w-100 justify-content-center"
            style={{
              padding: "20px 0",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Form
              inline
              className="d-flex"
              style={{ width: "100%", maxWidth: "700px" }}
            >
              <FormControl
                type="text"
                placeholder="Search by Name, Skill, or Bio..."
                className="flex-grow-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  height: "50px",
                  borderRadius: "25px 0 0 25px",
                  border: "none",
                  paddingLeft: "20px",
                  fontSize: "1.1rem",
                }}
              />
              <Button
                variant="info"
                onClick={() => setSearchTerm("")}
                style={{
                  height: "50px",
                  borderRadius: "0 25px 25px 0",
                  border: "none",
                  backgroundColor: "#719b98",
                  color: "#f7f3f0",
                }}
                disabled={!isSearching}
              >
                {isSearching ? "Clear Search" : "Search"}
              </Button>
            </Form>
          </Navbar>
        </div>

        <div className="heading-container">
          {loading ? (
            <div
              className="container d-flex justify-content-center align-items-center"
              style={{ height: "50vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : isSearching ? (
            <>
              <h1
                style={{
                  fontFamily: "Josefin Sans, sans-serif",
                  color: "#ffd88a",
                  marginTop: "2rem",
                  marginBottom: "1rem",
                }}
              >
                Search Results ({filteredUsers.length})
              </h1>
              <div className="profile-cards">
                {filteredUsers.length > 0 ? (
                  renderProfileCards(filteredUsers)
                ) : (
                  <h1 style={{ color: "#ffd88a" }}>
                    No users match your search criteria.
                  </h1>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="profile-cards">{renderProfileCards(allUsers)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
