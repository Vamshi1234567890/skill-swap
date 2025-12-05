import express from "express";


const router = express.Router();

// Video call room information endpoint
router.get("/:roomId", (req, res) => {
    console.log("-=",req.params)
  try {
    const { roomId } = req.params;

    
    // Extract chat ID from room ID (room format: room_chatId_timestamp)
    const chatId = roomId.split('_')[1];
    
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID format"
      });
    }

    // You can add additional validation here:
    // - Check if the user has access to this chat
    // - Verify the room is still active
    // - Log the join attempt for analytics

    res.status(200).json({
      success: true,
      message: "Room information retrieved successfully",
      data: {
        roomId,
        chatId,
        timestamp: Date.now(),
        // Add any other room metadata you need
        zegoAppId: process.env.ZEGO_APP_ID || 843454973,
        // You could also generate the token here if needed
      }
    });

  } catch (error) {
    console.error("Error in video room endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Generate Zego token endpoint (optional - if you want to generate tokens server-side)
router.post("/generate-token",  (req, res) => {
  try {
    const { roomId, userId, userName } = req.body;

    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Room ID and User ID are required"
      });
    }

    
    const appID = process.env.ZEGO_APP_ID || 843454973;
    const serverSecret = process.env.ZEGO_SERVER_SECRET || "81b9e533ea08541d76bd668d2b4e388f";

    // In a real implementation, you'd generate the token server-side
    // For now, we'll return the credentials and let frontend generate the token
    res.status(200).json({
      success: true,
      message: "Video call credentials",
      data: {
        appID,
        roomId,
        userId,
        userName: userName || "User",
        // In production, generate the token server-side for security
        // token: generateZegoToken(appID, serverSecret, roomId, userId, userName)
      }
    });

  } catch (error) {
    console.error("Error generating video token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// End call endpoint (for logging/analytics)
router.post("/end-call",  (req, res) => {
  try {
    const { roomId, userId, duration } = req.body;

    console.log(`Video call ended: Room ${roomId}, User ${userId}, Duration: ${duration}s`);

    // Here you can:
    // - Log the call duration for analytics
    // - Update call history in database
    // - Send notifications if needed

    res.status(200).json({
      success: true,
      message: "Call ended successfully"
    });

  } catch (error) {
    console.error("Error ending video call:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;