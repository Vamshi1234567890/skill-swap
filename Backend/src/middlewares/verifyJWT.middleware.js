import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
dotenv.config();

// 1. Existing Middleware for Email Registration (No Change)
const verifyJWT_email = asyncHandler(async (req, res, next) => {
  try {
    console.log("\n******** Inside verifyJWT_email Function ********");

    const token = req.cookies?.accessTokenRegistration || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("token not found");
      throw new ApiError(401, "Please Login");
    }


    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UnRegisteredUser.findOne({ email: decodedToken?.email }).select(
      "-_id -__v -createdAt -updatedAt"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    console.log("middleware", user);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token Expired");
      throw new ApiError(401, "Login Again, Session Expired");
    } else {
      console.log("Error in VerifyJWT_email Middleware:", error);
      throw new ApiError(401, error.message || "Invalid Access Token");
    }
  }
});

// 2. Existing Middleware for Username Login (No Change)
const verifyJWT_username = asyncHandler(async (req, res, next) => {
  try {
    console.log("\n******** Inside verifyJWT_username Function ********");

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("token not found");
      throw new ApiError(401, "Please Login");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ username: decodedToken?.username }).select("-__v -createdAt -updatedAt");
    
    // NOTE: This user object now contains the 'isAdmin' field from the updated schema
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    // console.log(user);
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token Expired");
      throw new ApiError(401, "Please Login");
    } else {
      console.log("Error in VerifyJWT_username Middleware:", error);
      throw new ApiError(401, error.message || "Invalid Access Token");
    }
  }
});


// 3. 🆕 NEW ADMIN AUTHORIZATION MIDDLEWARE 🆕
const adminAuth = asyncHandler(async (req, res, next) => {
    try {
        console.log("\n******** Inside adminAuth Function ********");

        // The req.user object must be populated by a preceding middleware (like verifyJWT_username)
        const user = req.user; 

        if (!user) {
            // This is a safety check; should be impossible if verifyJWT_username ran first
            throw new ApiError(401, "User data not available. Unauthorized access.");
        }
        
        // Check for the new 'isAdmin' field
        if (user.isAdmin) {
            console.log(`Admin access granted for user: ${user.username}`);
            next(); // User is an admin
        } else {
            console.log(`Access denied for non-admin user: ${user.username}`);
            throw new ApiError(403, "Access denied. Admin privileges required."); // 403 Forbidden
        }

    } catch (error) {
        console.error("Error in adminAuth Middleware:", error.message);
        throw new ApiError(error.statusCode || 403, error.message || "Forbidden access.");
    }
});


export { verifyJWT_email, verifyJWT_username, adminAuth }; // Export the new middleware