import React, { useEffect, useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import Spinner from "react-bootstrap/Spinner";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import RequestCard from "./RequestCard";
import "./Chats.css";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Modal from "react-bootstrap/Modal";

const Chats = () => {
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);

  const [scheduleModalShow, setScheduleModalShow] = useState(false);
  const [requestModalShow, setRequestModalShow] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // to store selected chat
  const [selectedChat, setSelectedChat] = useState(null);
  // to store chat messages
  const [chatMessages, setChatMessages] = useState([]);
  // to store chats
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  // to store message
  const [message, setMessage] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const { user, setUser } = useUser();
  const socketRef = useRef(null);
  const zegoRef = useRef(null);
  const navigate = useNavigate();

  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
  });

  // Set axios baseURL
  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:8000";
  }, []);

  // Initialize socket connection once
  useEffect(() => {
    const initializeSocket = () => {
      if (socketRef.current) {
        console.log("Socket already initialized");
        return;
      }

      console.log("🔄 Initializing socket connection...");
      
      const socketUrl = "http://localhost:8000";
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current.id);
        setSocketConnected(true);
        if (user) {
          console.log("Emitting setup with user:", user._id, user.name);
          socketRef.current.emit("setup", user);
        }
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setSocketConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("🔴 Socket connection error:", error);
        setSocketConnected(false);
      });

      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
        setSocketConnected(true);
        if (user) {
          socketRef.current.emit("setup", user);
        }
      });
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      
      if (zegoRef.current) {
        console.log("🧹 Cleaning up Zego instance");
        zegoRef.current.destroy();
        zegoRef.current = null;
      }
    };
  }, []);

  // Setup user when user changes
  useEffect(() => {
    if (user && socketRef.current?.connected) {
      console.log("👤 User changed, emitting setup:", user._id, user.name);
      socketRef.current.emit("setup", user);
    }
  }, [user]);

  // Setup socket listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleMessageReceived = (newMessageRecieved) => {
      console.log("💬 New Message Received: ", newMessageRecieved);
      if (selectedChat && selectedChat.id === newMessageRecieved.chatId._id) {
        setChatMessages((prevState) => [...prevState, newMessageRecieved]);
      }
    };

    const handleVideoCallInvitation = (data) => {
      console.log("📞 Incoming video call:", data);
      setIncomingCall(data);
      toast.info(`Incoming video call from ${data.callerName}`);
    };

    const handleVideoCallRejected = (data) => {
      console.log("❌ Call rejected");
      toast.error("Call was rejected");
      setShowVideoCall(false);
      setIncomingCall(null); // Clear incoming call state
    };

    const handleVideoCallAccepted = (data) => {
      console.log("✅ Call accepted");
      joinVideoCall(data.roomId);
    };

    const handleVideoCallError = (data) => {
      console.log("🔴 Call error:", data);
      toast.error(data.message);
      setShowVideoCall(false);
      setIncomingCall(null); // Clear incoming call state
    };

    // Remove any existing listeners first
    socket.off("message recieved");
    socket.off("video_call_invitation");
    socket.off("video_call_rejected");
    socket.off("video_call_accepted");
    socket.off("video_call_error");

    // Setup new listeners
    socket.on("message recieved", handleMessageReceived);
    socket.on("video_call_invitation", handleVideoCallInvitation);
    socket.on("video_call_rejected", handleVideoCallRejected);
    socket.on("video_call_accepted", handleVideoCallAccepted);
    socket.on("video_call_error", handleVideoCallError);

    return () => {
      socket.off("message recieved", handleMessageReceived);
      socket.off("video_call_invitation", handleVideoCallInvitation);
      socket.off("video_call_rejected", handleVideoCallRejected);
      socket.off("video_call_accepted", handleVideoCallAccepted);
      socket.off("video_call_error", handleVideoCallError);
    };
  }, [selectedChat]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setChatLoading(true);
      const tempUser = JSON.parse(localStorage.getItem("userInfo"));
      const { data } = await axios.get("/chat");
      if (tempUser?._id) {
        const temp = data.data.map((chat) => {
          const otherUser = chat?.users?.find((u) => u?._id !== tempUser?._id);
          return {
            id: chat._id,
            name: otherUser?.name || "Unknown User",
            picture: otherUser?.picture || "https://via.placeholder.com/150",
            username: otherUser?.username || "unknown",
            userId: otherUser?._id,
          };
        });
        setChats(temp);
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatClick = async (chatId) => {
    try {
      setChatMessageLoading(true);
      const { data } = await axios.get(`/message/getMessages/${chatId}`);
      setChatMessages(data.data || []);
      setMessage("");
      const chatDetails = chats.find((chat) => chat.id === chatId);
      setSelectedChat(chatDetails);
      
      if (socketRef.current && socketConnected) {
        socketRef.current.emit("join chat", chatId);
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setChatMessageLoading(false);
    }
  };

  const sendMessage = async (e) => {
    if (!socketConnected) {
      toast.error("Connection lost. Please refresh the page.");
      return;
    }

    if (!selectedChat) {
      toast.error("Please select a chat first");
      return;
    }

    try {
      if (socketRef.current) {
        socketRef.current.emit("stop typing", selectedChat._id);
      }
      if (message === "") {
        toast.error("Message is empty");
        return;
      }
      const { data } = await axios.post("/message/sendMessage", { 
        chatId: selectedChat.id, 
        content: message 
      });
      
      if (socketRef.current) {
        socketRef.current.emit("new message", data.data);
      }
      
      setChatMessages((prevState) => [...prevState, data.data]);
      setMessage("");
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await axios.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
      const { data } = await axios.get("/request/incoming");
      setRequests(data.data);
      console.log(data.data);
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await axios.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleTabClick = async (tab) => {
    if (tab === "chat") {
      setShowChatHistory(true);
      setShowRequests(false);
      await fetchChats();
    } else if (tab === "requests") {
      setShowChatHistory(false);
      setShowRequests(true);
      await getRequests();
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setRequestModalShow(true);
  };

  const handleRequestAccept = async (e) => {
    console.log("Request accepted");

    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post("/request/accept", { requestId: selectedRequest._id });
      console.log(data);
      setRequests((prevState) => prevState.filter((request) => request._id !== selectedRequest._id));
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await axios.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const handleRequestReject = async () => {
    console.log("Request rejected");
    try {
      setAcceptRequestLoading(true);
      const { data } = await axios.post("/request/rejectRequest", { requestId: selectedRequest._id });
      console.log(data);
      setRequests((prevState) => prevState.filter((request) => request._id !== selectedRequest._id));
    } catch (err) {
      console.log(err);
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
        if (err.response.data.message === "Please Login") {
          await axios.get("/auth/logout");
          setUser(null);
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  // Generate a unique room ID for the chat with random string
  const generateRoomId = (chatId) => {
    const randomString = Math.random().toString(36).substring(2, 15);
    return `room_${chatId}_${Date.now()}_${randomString}`;
  };

  const startVideoCall = async () => {
    if (!selectedChat) {
      toast.error("Please select a chat first");
      return;
    }

    if (!socketConnected) {
      toast.error("Connection lost. Please refresh the page.");
      return;
    }

    const roomId = generateRoomId(selectedChat.id);
    setActiveRoomId(roomId);
    setShowVideoCall(true);

    console.log("Starting video call to:", selectedChat.userId);
    console.log("Room ID:", roomId);

    // Send invitation to the other user
    if (socketRef.current && socketConnected) {
      socketRef.current.emit("video_call_invitation", {
        roomId: roomId,
        callerId: user._id,
        callerName: user.name,
        recipientId: selectedChat.userId,
        chatId: selectedChat.id
      });
      console.log("Video call invitation emitted");
    } else {
      console.error("Socket not connected");
      toast.error("Connection error. Please refresh the page.");
      setShowVideoCall(false);
      return;
    }

    toast.info("Calling... waiting for recipient to accept");

    // Start the call after a short delay
    setTimeout(() => {
      joinVideoCall(roomId);
    }, 1000);
  };

  // ---------- Safe joinVideoCall ----------
const joinVideoCall = (roomId) => {
  try {
    // cleanup previous
    if (zegoRef.current && typeof zegoRef.current.destroy === "function") {
      console.log("Cleaning up previous Zego instance");
      try { zegoRef.current.destroy(); } catch (e) { console.warn("destroy() threw", e); }
      zegoRef.current = null;
    }

    const appID = 1231668758;
    const serverSecret = "b5dc42868e71e958eb91e222ce7b000f";

    // generate token for testing
    let kitToken;
    try {
      kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        user._id,
        user.name
      );
    } catch (e) {
      console.error("Failed to generate kit token:", e);
      toast.error("Video init error (token).");
      return;
    }

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoRef.current = zp;

    // joinRoom DOES NOT reliably return a Promise in the UI kit; use callbacks
    zp.joinRoom({
      container: document.getElementById("videoContainer"),
      sharedLinks: [
        {
          name: "Join Call",
          url: `${window.location.origin}/video-call/${roomId}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      showPreJoinView: false,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,

      // callback when joined (use this instead of .then)
      onJoinRoom: (roomUsers) => {
        console.log("✅ onJoinRoom callback: joined Zego room:", roomId, "users:", roomUsers);
      },

      // callback when left (optional)
      onLeaveRoom: () => {
        console.log("onLeaveRoom: left room", roomId);
      },

      // generic error callback (important for troubleshooting)
      onError: (err) => {
        console.error("Zego joinRoom onError:", err);
        toast.error("Failed to join Zego room (see console).");
        // cleanup UI / instance if needed
        if (zegoRef.current) {
          try { zegoRef.current.destroy(); } catch (e) {}
          zegoRef.current = null;
        }
        setShowVideoCall(false);
      }
    });

    setActiveRoomId(roomId);
    window.currentRoomId = roomId;
    window.currentCallStartTime = Date.now();
  } catch (err) {
    console.error("joinVideoCall unexpected error:", err);
    toast.error("Unexpected error joining call");
  }
};

// ---------- Safe startScreenShare ----------
const startScreenShare = () => {
  if (!selectedChat) {
    toast.error("Please select a chat first");
    return;
  }
  if (!socketConnected) {
    toast.error("Connection lost. Please refresh the page.");
    return;
  }

  const roomId = generateRoomId(selectedChat.id);
  setActiveRoomId(roomId);
  setShowVideoCall(true);

  if (socketRef.current && socketConnected) {
    socketRef.current.emit("video_call_invitation", {
      roomId,
      callerId: user._id,
      callerName: user.name,
      recipientId: selectedChat.userId,
      chatId: selectedChat.id,
      isScreenShare: true,
    });
  }

  toast.info("Starting screen share... waiting for recipient to join");

  // cleanup previous if exists
  if (zegoRef.current && typeof zegoRef.current.destroy === "function") {
    console.log("Destroying previous Zego instance before starting screen share");
    try { zegoRef.current.destroy(); } catch (e) { console.warn("destroy threw", e); }
    zegoRef.current = null;
  }

  // same token flow
  const appID = 1231668758;
  const serverSecret = "b5dc42868e71e958eb91e222ce7b000f";

  let kitToken;
  try {
    kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      user._id,
      user.name
    );
  } catch (e) {
    console.error("generateKitTokenForTest error:", e);
    toast.error("Screen share init error (token).");
    setShowVideoCall(false);
    return;
  }

  const zp = ZegoUIKitPrebuilt.create(kitToken);
  zegoRef.current = zp;

  zp.joinRoom({
    container: document.getElementById("videoContainer"),
    scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
    showScreenSharingButton: true,
    showPreJoinView: false,
    turnOnMicrophoneWhenJoining: true,
    turnOnCameraWhenJoining: true,

    onJoinRoom: (roomUsers) => {
      console.log("✅ onJoinRoom for screen share:", roomId, roomUsers);
      // Optionally auto-trigger screen capture here using the kit's UI or let user click the screen button
    },

    onError: (err) => {
      console.error("Zego joinRoom (screenshare) onError:", err);
      toast.error("Failed to start screen share");
      if (zegoRef.current) { try { zegoRef.current.destroy(); } catch(e){} zegoRef.current = null; }
      setShowVideoCall(false);
    }
  });
};


  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    
    console.log("✅ Accepting incoming call, closing modal");
    
    // Store the call data before clearing
    const callData = { ...incomingCall };
    
    // Clear the modal immediately
    setIncomingCall(null);
    
    setShowVideoCall(true);
    setActiveRoomId(callData.roomId);
    
    // Notify the caller that the call was accepted
    if (socketRef.current && socketConnected) {
      socketRef.current.emit("video_call_accepted", {
        roomId: callData.roomId,
        recipientId: callData.callerId
      });
    }

    // Join the call
    joinVideoCall(callData.roomId);
  };

  const rejectIncomingCall = () => {
    if (!incomingCall) return;
    
    console.log("❌ Rejecting incoming call, closing modal");
    
    // Store the call data before clearing
    const callData = { ...incomingCall };
    
    // Clear the modal immediately
    setIncomingCall(null);
    
    // Notify the caller that the call was rejected
    if (socketRef.current && socketConnected) {
      socketRef.current.emit("video_call_rejected", {
        roomId: callData.roomId,
        recipientId: callData.callerId
      });
    }

    toast.info("Call rejected");
  };

  const endVideoCall = () => {
    console.log("📞 Ending video call");
    
    if (zegoRef.current) {
      console.log("Cleaning up Zego instance");
      zegoRef.current.destroy();
      zegoRef.current = null;
    }

    setShowVideoCall(false);
    setActiveRoomId(null);
    setIncomingCall(null); // Ensure incoming call is cleared
    
    const videoContainer = document.getElementById("videoContainer");
    if (videoContainer) {
      videoContainer.innerHTML = '';
    }
  };

  // Close modal when clicking outside
  const handleModalClose = (e) => {
    if (e.target.className === 'modalBG') {
      setIncomingCall(null);
      setRequestModalShow(false);
      setScheduleModalShow(false);
    }
  };

  return (
    <div className="container-overall">
      {/* Connection Status Indicator */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '5px 10px',
        borderRadius: '5px',
        backgroundColor: socketConnected ? '#4CAF50' : '#f44336',
        color: 'white',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div 
          className="modalBG" 
          style={{zIndex: 1000}} 
          onClick={handleModalClose}
        >
          <div 
            className="modalContent" 
            style={{textAlign: 'center', padding: '20px'}}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <h2>Incoming Video Call</h2>
            <p>From: {incomingCall.callerName}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button 
                className="connect-button" 
                onClick={acceptIncomingCall}
              >
                Accept
              </button>
              <button 
                className="report-button" 
                onClick={rejectIncomingCall}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of your JSX remains the same */}
      <div className="container-right">
        {/* Chat History */}
        <div className="container-left">
          {/* Tabs */}
          <div className="tabs">
            <Button
              className="chatButton"
              variant="secondary"
              style={{
                borderTop: showChatHistory ? "1px solid lightgrey" : "1px solid lightgrey",
                borderRight: showChatHistory ? "1px solid lightgrey" : "1px solid lightgrey",
                borderLeft: showChatHistory ? "1px solid lightgrey" : "1px solid lightgrey",
                borderBottom: "none",
                backgroundColor: showChatHistory ? "#3bb4a1" : "#2d2d2d",
                color: showChatHistory ? "black" : "white",
                cursor: "pointer",
                minWidth: "150px",
                padding: "10px",
                borderRadius: "5px 5px 0 0",
              }}
              onClick={() => handleTabClick("chat")}
            >
              Chat History
            </Button>
            <Button
              className="requestButton"
              variant="secondary"
              style={{
                borderTop: showRequests ? "1px solid lightgrey" : "1px solid lightgrey",
                borderRight: showRequests ? "1px solid lightgrey" : "1px solid lightgrey",
                borderLeft: showRequests ? "1px solid lightgrey" : "1px solid lightgrey",
                borderBottom: "none",
                backgroundColor: showChatHistory ? "#2d2d2d" : "#3bb4a1",
                color: showChatHistory ? "white" : "black",
                cursor: "pointer",
                minWidth: "150px",
                padding: "10px",
                borderRadius: "5px 5px 0 0",
              }}
              onClick={() => handleTabClick("requests")}
            >
              Requests
            </Button>
          </div>

          {/* Chat History or Requests List */}
          {showChatHistory && (
            <div className="container-left">
              <ListGroup className="chat-list">
                {chatLoading ? (
                  <div className="row m-auto mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-center mt-2">Loading chats...</p>
                  </div>
                ) : (
                  <>
                    {chats.length === 0 ? (
                      <div className="text-center p-4">
                        <p>No chats found</p>
                        <p className="text-muted">Start a conversation with someone to see chats here.</p>
                      </div>
                    ) : (
                      chats.map((chat) => (
                        <ListGroup.Item
                          key={chat.id}
                          onClick={() => handleChatClick(chat.id)}
                          style={{
                            cursor: "pointer",
                            marginBottom: "10px",
                            padding: "10px",
                            backgroundColor: selectedChat?.id === chat?.id ? "#3BB4A1" : "lightgrey",
                            borderRadius: "5px",
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <img
                              src={chat.picture}
                              alt={chat.name}
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                marginRight: "10px",
                              }}
                            />
                            <span>{chat.name}</span>
                          </div>
                        </ListGroup.Item>
                      ))
                    )}
                  </>
                )}
              </ListGroup>
            </div>
          )}
          {showRequests && (
            <div className="container-left">
              <ListGroup style={{ padding: "10px" }}>
                {requestLoading ? (
                  <div className="row m-auto mt-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-center mt-2">Loading requests...</p>
                  </div>
                ) : (
                  <>
                    {requests.length === 0 ? (
                      <div className="text-center p-4">
                        <p>No pending requests</p>
                      </div>
                    ) : (
                      requests.map((request) => (
                        <ListGroup.Item
                          key={request._id}
                          onClick={() => handleRequestClick(request)}
                          style={{
                            cursor: "pointer",
                            marginBottom: "10px",
                            padding: "10px",
                            backgroundColor:
                              selectedRequest && selectedRequest._id === request._id ? "#3BB4A1" : "lightgrey",
                            borderRadius: "5px",
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <img
                              src={request.picture || "https://via.placeholder.com/150"}
                              alt={request.name}
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                marginRight: "10px",
                              }}
                            />
                            <span>{request.name}</span>
                          </div>
                        </ListGroup.Item>
                      ))
                    )}
                  </>
                )}
              </ListGroup>
            </div>
          )}
          {requestModalShow && (
            <div className="modalBG" onClick={handleModalClose}>
              <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ textAlign: "center" }}>Confirm your choice?</h2>
                {selectedRequest && (
                  <RequestCard
                    name={selectedRequest?.name}
                    skills={selectedRequest?.skillsProficientAt}
                    rating="4"
                    picture={selectedRequest?.picture}
                    username={selectedRequest?.username}
                    onClose={() => setRequestModalShow(false)}
                  />
                )}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button className="connect-button" style={{ marginLeft: "0" }} onClick={handleRequestAccept}>
                    {acceptRequestLoading ? (
                      <div className="row m-auto ">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      "Accept!"
                    )}
                  </button>
                  <button className="report-button" onClick={handleRequestReject}>
                    {acceptRequestLoading ? (
                      <div className="row m-auto ">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      "Reject"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Right Section */}
        <div className="container-chat">
          {/* Profile Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              borderBottom: "1px solid #2d2d2d",
              minHeight: "50px",
            }}
          >
            {/* Profile Info */}
            {selectedChat && (
              <>
                <div>
                  <img
                    src={selectedChat?.picture ? selectedChat.picture : "https://via.placeholder.com/150"}
                    alt="Profile"
                    style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                  />
                  <span style={{ fontFamily: "Montserrat, sans-serif", color: "#2d2d2d" }}>
                    {selectedChat?.name}
                  </span>
                </div>
                <div>
                  {showVideoCall ? (
                    <Button
                      variant="danger"
                      onClick={endVideoCall}
                      style={{ marginRight: "10px" }}
                    >
                      End Call
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="info"
                        onClick={startVideoCall}
                        style={{ marginRight: "10px" }}
                        disabled={!socketConnected || !selectedChat}
                      >
                        Video Call {!socketConnected && "(Offline)"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={startScreenShare}
                        disabled={!socketConnected || !selectedChat}
                      >
                        Share Screen {!socketConnected && "(Offline)"}
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Chat Interface */}
          <div style={{ flex: "7", position: "relative", height: "calc(100vh - 160px)" }}>
            
            {/* Video Call Container */}
            {selectedChat && showVideoCall && (
              <div id="videoContainer" style={{ width: "100%", height: "80vh" }}></div>
            )}

            {/* Chat Messages - only show when not in video call */}
            {!showVideoCall && (
              <div
                style={{
                  height: "calc(100% - 50px)",
                  color: "#3BB4A1",
                  padding: "20px",
                  overflowY: "auto",
                  position: "relative",
                }}
              >
                {selectedChat ? (
                  <>
                    {chatMessageLoading ? (
                      <div className="row h-100 d-flex justify-content-center align-items-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-center mt-2">Loading messages...</p>
                      </div>
                    ) : (
                      <ScrollableFeed forceScroll="true">
                        {chatMessages.length === 0 ? (
                          <div className="text-center p-4">
                            <p>No messages yet</p>
                            <p className="text-muted">Start the conversation!</p>
                          </div>
                        ) : (
                          chatMessages.map((message, index) => {
                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  justifyContent: message.sender._id == user._id ? "flex-end" : "flex-start",
                                  marginBottom: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    backgroundColor: message.sender._id === user._id ? "#3BB4A1" : "#2d2d2d",
                                    color: "#ffffff",
                                    padding: "10px",
                                    borderRadius: "10px",
                                    maxWidth: "70%",
                                    textAlign: message.sender._id == user._id ? "right" : "left",
                                  }}
                                >
                                  {message.content}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </ScrollableFeed>
                    )}
                  </>
                ) : (
                  <div className="row w-100 h-100 d-flex justify-content-center align-items-center">
                    <h3 className="row w-100 d-flex justify-content-center align-items-center">
                      Select a chat to start messaging
                    </h3>
                  </div>
                )}
              </div>
            )}

            {/* Chat Input - only show when not in video call */}
            {selectedChat && !showVideoCall && (
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  padding: "10px",
                  borderTop: "1px solid #2d2d2d",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    flex: "1",
                    padding: "10px",
                    borderRadius: "5px",
                    marginRight: "10px",
                    border: "1px solid #2d2d2d",
                  }}
                />
                <Button 
                  variant="success" 
                  style={{ padding: "10px 20px", borderRadius: "5px" }} 
                  onClick={sendMessage}
                  disabled={!socketConnected}
                >
                  Send {!socketConnected && "(Offline)"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Video Call Modal */}
      {scheduleModalShow && (
        <div className="modalBG" onClick={handleModalClose}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Request a Meeting</h3>
            <Form>
              <Form.Group controlId="formDate" style={{ marginBottom: "20px", zIndex: "1001" }}>
                <Form.Label>Preferred Date</Form.Label>
                <Form.Control
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                />
              </Form.Group>

              <Form.Group controlId="formTime" style={{ marginBottom: "20px", zIndex: "1001" }}>
                <Form.Label>Preferred Time</Form.Label>
                <Form.Control
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                />
              </Form.Group>

              <Button
                variant="success"
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  if (scheduleForm.date === "" || scheduleForm.time === "") {
                    toast.error("Please fill all the fields");
                    return;
                  }

                  scheduleForm.username = selectedChat.username;
                  try {
                    const { data } = await axios.post("/user/sendScheduleMeet", scheduleForm);
                    setScheduleForm({
                      date: "",
                      time: "",
                    });
                  } catch (error) {
                    console.log(error);
                    if (error?.response?.data?.message) {
                      toast.error(error.response.data.message);
                      if (error.response.data.message === "Please Login") {
                        localStorage.removeItem("userInfo");
                        setUser(null);
                        await axios.get("/auth/logout");
                        navigate("/login");
                      }
                    } else {
                      toast.error("Something went wrong");
                    }
                  }
                  setScheduleModalShow(false);
                }}
              >
                Submit
              </Button>
              <Button variant="danger" onClick={() => setScheduleModalShow(false)} style={{ marginLeft: "10px" }}>
                Cancel
              </Button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;