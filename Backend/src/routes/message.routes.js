import express from "express";
import multer from "multer";
import { sendMessageWithFile, sendMessage, getMessages } from "../controllers/message.controllers.js";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";

const router = express.Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB, adjust as needed
});

router.post("/sendMessageWithFile", verifyJWT_username, upload.single("file"), sendMessageWithFile);
router.post("/sendMessage", verifyJWT_username, sendMessage);
router.get("/getMessages/:chatId", verifyJWT_username, getMessages);

export default router;