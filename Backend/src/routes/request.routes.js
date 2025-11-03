import { Router } from "express";
import { verifyJWT_username } from "../middlewares/verifyJWT.middleware.js";
import {
    createRequest, // Correct name exported from the controller
    getRequests,     
    acceptRequest,   
    rejectRequest    
} from "../controllers/request.controllers.js";

const router = Router();

// =======================================================
// CONNECTION REQUEST ROUTES
// =======================================================

// Route to send a new connection request
router.route("/create").post(verifyJWT_username, createRequest);

// Route to get all incoming pending requests 
router.route("/incoming").get(verifyJWT_username, getRequests);

// Route to accept a pending request
router.route("/accept").post(verifyJWT_username, acceptRequest);

// Route to reject a pending request
router.route("/reject").post(verifyJWT_username, rejectRequest);

export default router;
