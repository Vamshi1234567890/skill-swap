import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load user from localStorage if available
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        setUser(userInfo);
      } catch (error) {
        console.error("Error parsing userInfo:", error);
        localStorage.removeItem("userInfo");
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    // Protect routes that require login
    const publicPaths = ["/login", "/register", "/about_us", "/discover", "/"];
    const currentPath = location.pathname;

    if (!publicPaths.includes(currentPath) && !user) {
      navigate("/login");
    }
  }, [location.pathname, navigate, user]);

  // Login helper
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  // Logout helper
  const logout = async () => {
  try {
    await axios.get("/auth/logout"); // backend logout
  } catch (error) {
    console.log(error);
  } finally {
    localStorage.removeItem("userInfo"); // clear stored user
    setUser(null); // clear context
    navigate("/login"); // redirect to login page
  }
};

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};

export { UserContextProvider, useUser };
