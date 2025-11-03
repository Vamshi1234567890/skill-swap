import React, { useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useUser } from "../../util/UserContext";
import { Dropdown } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const UserProfileDropdown = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    try {
      await axios.get("/auth/logout");
      window.location.href = "http://localhost:5173/login";
    } catch (error) {
      console.error(error);
    }
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        onClick(e);
      }}
      style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          overflow: "hidden",
          marginRight: "10px",
        }}
      >
        <img
          src={user?.picture}
          alt="User Avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {children}
      &#x25bc;
    </div>
  ));

  const CustomMenu = React.forwardRef(
    ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
      const [value, setValue] = useState("");
      return (
        <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
          <ul className="list-unstyled">
            {React.Children.toArray(children).filter(
              (child) => !value || child.props.children.toLowerCase().startsWith(value)
            )}
          </ul>
        </div>
      );
    }
  );

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" />
      <Dropdown.Menu as={CustomMenu}>
        <Dropdown.Item
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Header = () => {
  const [navUser, setNavUser] = useState(null);
  const { user } = useUser();
  const [discover, setDiscover] = useState(false);

  useEffect(() => {
    setNavUser(JSON.parse(localStorage.getItem("userInfo")));
  }, [user]);

  useEffect(() => {
    const temp = window.location.href.split("/");
    const url = temp.pop();
    setDiscover(url.startsWith("discover"));
  }, [window.location.href]);

  return (
    <>
      <Navbar
        key="md"
        expand="md"
        style={{
          background: "linear-gradient(90deg, #d8dee0ff 0%, #d8e0e1ff 100%)",
          zIndex: 998,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Container fluid>
          <Navbar.Brand
            href="/"
            style={{
              fontFamily: "Poppins, sans-serif",
              color: "#ffffff",
              fontWeight: 600,
              letterSpacing: "0.5px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
           <img
  src="/assets/images/logo.png" // or {logo} if imported
  alt="Skill Swap Logo"
  style={{
    height: "40px", // proportional height
    width: "auto",  // keeps original aspect ratio
    borderRadius: "8px", // optional: remove if your logo shouldn’t be rounded
    objectFit: "contain",
    backgroundColor: "white", // optional if you want it visible on gradient
    padding: "1px",
    paddingRight: "4px",
  }}
/>
<span
  style={{
    fontFamily: "Poppins, sans-serif",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "1.2rem",
  }}
>
</span>


        
          </Navbar.Brand>

          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-md`}
            aria-labelledby={`offcanvasNavbarLabel-expand-md`}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title
                id={`offcanvasNavbarLabel-expand-md`}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#00a58c",
                  fontWeight: 600,
                }}
              >
                SkillSwap
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Nav.Link as={Link} to="/" style={{ color: "#2d2d2d" }}>
                  Home
                </Nav.Link>
                {navUser !== null ? (
                  <>
                    <Nav.Link as={Link} to="/discover" style={{ color: "#2d2d2d" }}>
                      Discover
                    </Nav.Link>
                    <Nav.Link as={Link} to="/chats" style={{ color: "#2d2d2d" }}>
                      Your Chats
                    </Nav.Link>
                    {discover && (
                      <>
                        <Nav.Link
                          href="#for-you"
                          className="d-md-none"
                          style={{
                            color: "#f56664",
                            fontSize: "1.1rem",
                            marginTop: "1rem",
                          }}
                        >
                          For You
                        </Nav.Link>
                        <Nav.Link
                          href="#popular"
                          className="d-md-none"
                          style={{
                            color: "#3bb4a1",
                            fontSize: "1.1rem",
                          }}
                        >
                          Popular
                        </Nav.Link>
                      </>
                    )}
                    <Nav.Link as={Dropdown}>
                      <UserProfileDropdown />
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/#why-skill-swap" style={{ color: "#2d2d2d" }}>
                      Why SkillSwap
                    </Nav.Link>
                    <Nav.Link as={Link} to="/login" style={{ color: "#2d2d2d" }}>
                      Login/Register
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
