import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const port = process.env.PORT || 8000;

// Store connected users
const connectedUsers = new Map();


connectDB()
  .then(() => {
    console.log("Database connected");
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Socket.io connection handling
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Handle user setup (when user logs in)
      socket.on("setup", (userData) => {
        if (userData && userData._id) {
          connectedUsers.set(userData._id, socket.id);
          socket.userId = userData._id;
          console.log(`User ${userData._id} connected with socket ${socket.id}`);
          socket.join(userData._id);
          socket.emit("connected");
          
          // Log all connected users for debugging
          console.log("Currently connected users:", Array.from(connectedUsers.entries()));
        }
      });

      // Handle video call invitations
      socket.on("video_call_invitation", (data) => {
        console.log("Video call invitation received:", data);
        console.log("Caller ID:", data.callerId);
        console.log("Recipient ID:", data.recipientId);
        
  // Log all connected users to debug
  console.log("Connected users map:", Array.from(connectedUsers.entries()));

  // Look up recipient's socket id and log result
  const recipientSocketId = connectedUsers.get(data.recipientId);
  console.log("Recipient socket ID found:", recipientSocketId);
        
        if (recipientSocketId) {
          // Use io.to() to emit to specific socket
          io.to(recipientSocketId).emit("video_call_invitation", {
            roomId: data.roomId,
            callerId: data.callerId,
            callerName: data.callerName,
            recipientId: data.recipientId,
            chatId: data.chatId,
            isScreenShare: data.isScreenShare || false
          });
          console.log(`Call invitation sent to user ${data.recipientId} with socket ${recipientSocketId}`);
        } else {
          // If recipient is not connected, notify the caller
          socket.emit("video_call_error", {
            message: "User is not available"
          });
          console.log(`User ${data.recipientId} is not connected. Available users:`, Array.from(connectedUsers.keys()));
        }
      });

      // Handle call acceptance
      socket.on("video_call_accepted", (data) => {
        console.log("Video call accepted:", data);
        
        const callerSocketId = connectedUsers.get(data.recipientId);
        console.log("Caller socket ID found:", callerSocketId);
        
        if (callerSocketId) {
          io.to(callerSocketId).emit("video_call_accepted", {
            roomId: data.roomId,
            recipientId: socket.userId
          });
          console.log(`Call acceptance sent to caller ${data.recipientId}`);
        } else {
          console.log(`Caller ${data.recipientId} not found for call acceptance`);
        }
      });

      // Handle call rejection
      socket.on("video_call_rejected", (data) => {
        console.log("Video call rejected:", data);
        
        const callerSocketId = connectedUsers.get(data.recipientId);
        if (callerSocketId) {
          io.to(callerSocketId).emit("video_call_rejected", {
            roomId: data.roomId,
            recipientId: socket.userId
          });
          console.log(`Call rejection sent to caller ${data.recipientId}`);
        }
      });

      // Handle joining chat rooms
      socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`User ${socket.userId} joined room: ${room}`);
      });

      // Handle new messages
      socket.on("new message", (newMessage) => {
        const chat = newMessage.chatId;
        if (!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach((user) => {
          if (user._id === newMessage.sender._id) return;
          
          const userSocketId = connectedUsers.get(user._id);
          if (userSocketId) {
            io.to(userSocketId).emit("message recieved", newMessage);
          }
        });
      });

      // Handle typing indicators
      socket.on("typing", (room) => {
        socket.to(room).emit("typing");
      });

      socket.on("stop typing", (room) => {
        socket.to(room).emit("stop typing");
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (socket.userId) {
          connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} removed from connected users`);
        }
      });
    });

    // Start server
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });