import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import videoRouter from "./routes/video.routes.js";

const app = express();

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Express middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Additional CORS headers
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Passport middleware
app.use(passport.initialize());

// Importing routes
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import requestRouter from "./routes/request.routes.js";
import reportRouter from "./routes/report.routes.js";
import ratingRouter from "./routes/rating.routes.js";
import adminRouter from "./routes/admin.routes.js";

// Using routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);
app.use("/uploads", express.static("uploads"));
app.use("/admin", adminRouter);
app.use("/video-call", videoRouter);

// Test route
app.get('/file-url', (req, res) => {
  const message = {
    fileUrl: '/path/to/file',
    originalFileName: 'example.txt'
  };
  res.json(message);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

export { app };