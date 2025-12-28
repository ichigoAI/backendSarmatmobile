import express from "express";
import {
  register,
  login,
  me,
  upgradeUser,
  getUser,
  updateUser,
  updateUserPartial,
  refresh
} from "../controllers/users.controller.js";


const router = express.Router();
import { logRequest } from "../controllers/authController.js";

router.use(logRequest);

router.post("/register", register);
router.post("/login", login);
router.get("/me", me); 

router.post("/upgrade", upgradeUser);

router.get("/:userId", getUser);
router.put('/:userId', updateUser);
router.put('/refresh', refresh);

// Mise à jour complète avec validation
router.patch("/:userId", updateUser);

// Mise à jour partielle rapide
router.patch("/:userId/quick", updateUserPartial);
export default router;
