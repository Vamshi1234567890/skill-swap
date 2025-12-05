
import { asyncHandler } from "../utils/asyncHandler.js";
import { Chat } from "../models/chat.model.js";

export const getOrCreateChat = asyncHandler(async (req, res) => {
  const { users } = req.body;
  const existingChat = await Chat.findOne({ users: { $all: users } });
  if (existingChat) {
    return res.status(200).json(new ApiResponse(200, existingChat, "Chat already exists"));
  }

  const chat = await Chat.create({ users });
  return res.status(200).json(new ApiResponse(200, chat, "Chat created successfully"));
});

