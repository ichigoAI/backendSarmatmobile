import express from "express";
import { getTips, addTip } from "../controllers/tips.controller.js";
import { logRequest } from "../controllers/authController.js";

const router = express.Router();
router.use(logRequest);

router.get("/", getTips);
router.post("/", addTip);

export default router;