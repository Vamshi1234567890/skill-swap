import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
      required: false, // <-- Change this to false
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    originalFileName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


const Message = mongoose.model("Message", MessageSchema);

export default Message;
