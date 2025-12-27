import express from "express";
import {getPlans,getPaymentMethods} from "../controllers/plans.controller"

const router = express.Router();

router.get("/", getPlans);
router.get("/payment-methods",getPaymentMethods);
export default router;
