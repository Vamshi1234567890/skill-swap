import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Header from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

// Pages
import LandingPage from "./Pages/LandingPage/LandingPage";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Discover from "./Pages/Discover/Discover";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Chats from "./Pages/Chats/Chats";
import Report from "./Pages/Report/Report";
import Profile from "./Pages/Profile/Profile";
import Rating from "./Pages/Rating/Rating";
import EditProfile from "./Pages/EditProfile/EditProfile";
import NotFound from "./Pages/NotFound/NotFound";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";
import VideoCallPage from './Components/VideoCallPage'

// Route Guards
import PrivateRoutes from "./util/PrivateRoutes";
import AdminRoutes from "./util/AdminRoutes";

const App = () => {
  return (
    <>
      <Header />
      <ToastContainer position="top-right" />

      <Routes>
        {/* ------------------- Private Routes (Login Required) ------------------- */}
        <Route element={<PrivateRoutes />}>
          <Route path="/chats" element={<Chats />} />
          <Route path="/edit_profile" element={<EditProfile />} />
          {/* Add more private routes here */}
        </Route>

        {/* ------------------- Admin Routes (Login + isAdmin Required) ------------------- */}
        <Route element={<AdminRoutes />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* ------------------- Public Routes ------------------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/report/:username" element={<Report />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/rating/:username" element={<Rating />} />
        <Route path="/chat/:chatId" element={<Chats />} />
        <Route path="/video-call/:roomId" element={<VideoCallPage />} />


        {/* ------------------- 404 Not Found ------------------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
