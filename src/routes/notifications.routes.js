import express from "express";
import { getNotifications, addNotification,markNotificationAsRead ,markAllNotificationsAsRead} from "../controllers/notifications.controller.js";
import { logRequest } from "../controllers/authController.js";


const router = express.Router();
router.use(logRequest);

router.get("/:user_id", getNotifications);
router.post("/", addNotification);
router.patch("/:id/read", markNotificationAsRead);

// Marquer toutes les notifications d'un utilisateur comme lues
router.post("/mark-all-read", markAllNotificationsAsRead);
export default router;
