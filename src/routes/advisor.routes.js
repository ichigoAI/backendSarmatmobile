// routes/advisorRoutes.js
import express from 'express';
import { getGlobalAdvisor } from '../controllers/advisor.controller.js';

const router = express.Router();

// Route pour récupérer le conseiller global
router.get('/global', getGlobalAdvisor);

export default router;