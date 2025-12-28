import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import {getPlans,getPaymentMethods} from "../controllers/plans.controller.js"

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();


router.post("/create-payment-intent", async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,          
      currency,        
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", getPlans);
router.get("/payment-methods",getPaymentMethods);
export default router;
