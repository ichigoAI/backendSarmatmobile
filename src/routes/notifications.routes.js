import express from "express";
import { getNotifications, addNotification } from "../controllers/notifications.controller.js";

const router = express.Router();

// Route pour récupérer toutes les notifications
router.get("/", getNotifications);

// Route pour ajouter une nouvelle notification
router.post("/", addNotification);

export default router;
