import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // to parse json in body
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // to parse url
app.use(express.static("public")); // to use static public folder
app.use(cookieParser()); // to enable CRUD operation on browser cookies

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // Add other CORS headers as needed
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
// 🆕 Import the new admin router
import adminRouter from "./routes/admin.routes.js"; 


// Using routes
// NOTE: I recommend prefixing your existing routes with '/api/v1' for consistency, 
// but for now, I'll keep your structure and mount admin under a dedicated path.
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/request", requestRouter);
app.use("/report", reportRouter);
app.use("/rating", ratingRouter);
app.use("/uploads", express.static("uploads"));
// app.use('/api', requestRoutes);

// 🆕 Mounting the new Admin Router
// The admin panel will now be accessible via routes starting with /admin, e.g., /admin/users
app.use("/admin", adminRouter);


app.get('/file-url', (req, res) => {
  const message = {
    fileUrl: '/path/to/file', // replace with your file path logic
    originalFileName: 'example.txt' // replace with your original file name logic
  };

  res.json(message);
});

export { app };