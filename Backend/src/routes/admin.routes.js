// ./Backend/routes/admin.routes.js

import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"; // Import the User model
// Import the necessary middlewares (ensure path is correct)
import { verifyJWT_username, adminAuth } from "../middlewares/verifyJWT.middleware.js"; 

const router = Router();

// ==========================================
// 🔐 ADMIN ROUTES - PROTECTED BY verifyJWT_username AND adminAuth 🔐
// ==========================================

// GET ALL USERS (Admin Dashboard Data)
router.route("/users").get(
    verifyJWT_username, 
    adminAuth, 
    asyncHandler(async (req, res) => {
        // Fetch all users but exclude sensitive fields like password
        const users = await User.find().select("-password -__v -refreshToken");

        if (!users || users.length === 0) {
            throw new ApiError(404, "No users found on the platform.");
        }

        return res
            .status(200)
            .json({ users, message: "All users fetched successfully for admin." });
    })
);


// BAN/UNBAN A USER
router.route("/user/toggleBan/:userId").put(
    verifyJWT_username, 
    adminAuth, 
    asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        // Assuming you add an 'isBanned' field to the User model for this logic
        // If not, you can delete the user directly (BE CAREFUL with deletion)
        
        // Example logic to safely block an account (requires a new 'isBanned' field in the schema)
        // user.isBanned = !user.isBanned; 
        // await user.save({ validateBeforeSave: false });

        // Example logic for direct DELETION (USE WITH CAUTION)
        await User.findByIdAndDelete(userId);
        
        return res
            .status(200)
            .json({ message: `User with ID ${userId} has been successfully deleted.` });
    })
);

// Add more admin routes here (e.g., /manageSkills, /viewStats)

export default router;