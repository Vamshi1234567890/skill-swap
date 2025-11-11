import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../util/UserContext";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Spinner from "react-bootstrap/Spinner";

const VideoCallPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinCall = async () => {
      if (!user || !roomId) {
        setError("Invalid room or user");
        setLoading(false);
        return;
      }

      try {
        // Verify room access
        const { data } = await axios.get(`http://localhost:8000/video-call/${roomId}`);
        
        if (data.success) {
          // Join the call
          const appID = 1231668758;
          const serverSecret = "b5dc42868e71e958eb91e222ce7b000f";

          const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            user._id,
            user.name
          );

          const zp = ZegoUIKitPrebuilt.create(kitToken);
          zp.joinRoom({
            container: document.getElementById("videoContainer"),
            scenario: {
              mode: ZegoUIKitPrebuilt.VideoConference,
            },
            showPreJoinView: false,
          });

          setLoading(false);
        }
      } catch (error) {
        console.error("Error joining video call:", error);
        setError("Unable to join video call");
        setLoading(false);
        toast.error("Failed to join video call");
      }
    };

    joinCall();
  }, [roomId, user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Joining video call...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/chats")}
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div id="videoContainer" style={{ width: "100%", height: "100vh" }}></div>
    </div>
  );
};

export default VideoCallPage;