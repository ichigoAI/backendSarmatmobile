import express from "express";
import { getTips, addTip } from "../controllers/tips.controller.js";

const router = express.Router();

router.get("/", getTips);
router.post("/", addTip);

export default router;