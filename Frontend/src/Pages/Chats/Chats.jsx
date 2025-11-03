import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import RequestCard from "./RequestCard";
import "./Chats.css";

var socket;

const Chats = () => {
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [acceptRequestLoading, setAcceptRequestLoading] = useState(false);

  const [scheduleModalShow, setScheduleModalShow] = useState(false);
  const [requestModalShow, setRequestModalShow] = useState(false);

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessageLoading, setChatMessageLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFilePreview, setAttachedFilePreview] = useState(null);

  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [scheduleForm, setScheduleForm] = useState({ date: "", time: "" });

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    socket = io(axios.defaults.baseURL);
    if (user) socket.emit("setup", user);

    socket.on("message recieved", (newMessage) => {
      if (selectedChat && selectedChat.id === newMessage.chatId._id) {
        setChatMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => socket.off("message recieved");
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setChatLoading(true);
      const { data } = await axios.get("http://localhost:8000/chat");
      const tempUser = JSON.parse(localStorage.getItem("userInfo"));

      if (tempUser?._id) {
        const temp = data.data.map((chat) => {
          const otherUser = chat.users.find((u) => u?._id !== tempUser?._id);
          return {
            id: chat._id,
            name: otherUser?.name || "Unknown",
            picture: otherUser?.picture || "",
            username: otherUser?.username || "",
          };
        });
        setChats(temp);
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatClick = async (chatId) => {
    try {
      setChatMessageLoading(true);
      const { data } = await axios.get(`http://localhost:8000/message/getMessages/${chatId}`);
      setChatMessages(data.data);

      const chatDetails = chats.find((chat) => chat.id === chatId);
      setSelectedChat(chatDetails);
      setMessage("");
      socket.emit("join chat", chatId);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setChatMessageLoading(false);
    }
  };

  const createChatHandler = async (otherUserId) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8000/chat",
        { users: [user._id, otherUserId] },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const existingChat = chats.find((chat) => chat.id === data.data._id);
      let newChat;
      if (!existingChat) {
        const otherUser = data.data.users.find((u) => u._id !== user._id);
        newChat = {
          id: data.data._id,
          name: otherUser?.name || "Unknown",
          username: otherUser?.username || "Unknown",
          picture: otherUser?.picture || "",
        };
        setChats([newChat, ...chats]);
      } else {
        newChat = existingChat;
      }

      setSelectedChat(newChat);
      handleChatClick(data.data._id);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to create chat");
    }
  };

  const handleRequestAccept = async () => {
    try {
      setAcceptRequestLoading(true);
const { data } = await axios.post("/api/request/acceptRequest", { requestId: selectedRequest._id });      toast.success(data.message);

      setRequests((prev) => prev.filter((req) => req._id !== selectedRequest._id));

      // Create/open chat with requester
      createChatHandler(selectedRequest._id);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setAcceptRequestLoading(false);
      setRequestModalShow(false);
    }
  };

  const handleTabClick = async (tab) => {
    if (tab === "chat") {
      setShowChatHistory(true);
      setShowRequests(false);
      await fetchChats();
    } else {
      setShowChatHistory(false);
      setShowRequests(true);
      await getRequests();
    }
  };

  const getRequests = async () => {
    try {
      setRequestLoading(true);
const { data } = await axios.get("/request/incoming");      setRequests(data.data);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="container-overall">
      <div className="container-right">
        {/* Left Sidebar */}
        <div className="container-left">
          <div className="tabs">
            <Button
              onClick={() => handleTabClick("chat")}
              style={{
                backgroundColor: showChatHistory ? "#3bb4a1" : "#2d2d2d",
                color: showChatHistory ? "black" : "white",
              }}
            >
              Chat History
            </Button>
            <Button
              onClick={() => handleTabClick("requests")}
              style={{
                backgroundColor: showChatHistory ? "#2d2d2d" : "#3bb4a1",
                color: showChatHistory ? "white" : "black",
              }}
            >
              Requests
            </Button>
          </div>

          {/* Chat List */}
          {showChatHistory && (
            <ListGroup className="chat-list">
              {chatLoading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                chats.map((chat) => (
                  <ListGroup.Item
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedChat?.id === chat?.id ? "#3BB4A1" : "lightgrey",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    {chat.name}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}

          {/* Requests List */}
          {showRequests && (
            <ListGroup style={{ padding: "10px" }}>
              {requestLoading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                requests.map((request) => (
                  <ListGroup.Item
                    key={request._id}
                    onClick={() => setSelectedRequest(request) || setRequestModalShow(true)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedRequest?._id === request._id ? "#3BB4A1" : "lightgrey",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    {request.name}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          )}
        </div>

        {/* Right Chat Area */}
        <div className="container-chat">
          {/* Profile Bar */}
          {selectedChat && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #2d2d2d", minHeight: "50px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={selectedChat.picture || "https://via.placeholder.com/150"} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }} />
                <div>
                  <h6 style={{ margin: 0 }}>{selectedChat.name}</h6>
                  <small>{selectedChat.username}</small>
                </div>
              </div>
              <Button variant="success" onClick={() => toast.info("Video Call Clicked")}>
                Request Video Call
              </Button>
            </div>
          )}

          {/* Chat Messages */}
          <div style={{ flex: 7, position: "relative", height: "calc(100vh - 160px)", overflowY: "auto" }}>
            {selectedChat ? (
              <ScrollableFeed forceScroll="true">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: msg.sender._id === user._id ? "flex-end" : "flex-start", marginBottom: "10px" }}>
                    <div style={{ backgroundColor: msg.sender._id === user._id ? "#3BB4A1" : "#2d2d2d", color: "#fff", padding: "10px", borderRadius: "10px", maxWidth: "70%", textAlign: msg.sender._id === user._id ? "right" : "left" }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </ScrollableFeed>
            ) : (
              <div className="row w-100 h-100 d-flex justify-content-center align-items-center">
                <h3>Select a chat to start messaging</h3>
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedChat && (
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!message.trim()) return;
                try {
                  const { data } = await axios.post(
                    `/message/sendMessage`,
                    { chatId: selectedChat.id, content: message },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                  );
                  setChatMessages([...chatMessages, data.data]);
                  setMessage("");
                  socket.emit("new message", data.data);
                } catch (err) {
                  console.log(err);
                  toast.error("Message sending failed");
                }
              }}
              style={{ display: "flex", padding: "10px", borderTop: "1px solid #2d2d2d" }}
            >
              <Form.Control
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" style={{ marginLeft: "10px" }}>
                Send
              </Button>
            </Form>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {requestModalShow && selectedRequest && (
        <div className="modalBG" onClick={() => setRequestModalShow(false)}>
          <div className="modalContent">
            <h2 style={{ textAlign: "center" }}>Confirm your choice?</h2>
            <RequestCard {...selectedRequest} onClose={() => setSelectedRequest(null)} />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="connect-button" onClick={handleRequestAccept}>
                {acceptRequestLoading ? <Spinner animation="border" /> : "Accept!"}
              </button>
              <button className="report-button" onClick={() => setRequestModalShow(false)}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
