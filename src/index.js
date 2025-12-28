import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import tipsRoutes from "./routes/tips.routes.js";

import serviceRoutes from "./routes/serviceRoutes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import plansRoutes from "./routes/plans.routes.js";
import usersRoutes from "./routes/users.routes.js"
import advisorRoutes from './routes/advisor.routes.js';


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());              
app.use(express.json());

// Routes
app.use("/api", serviceRoutes);
app.use("/api/tips", tipsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/advisor', advisorRoutes);


// Test route (important)
app.get("/ping", (req, res) => {
  res.json({ message: "API Smart Advice OK" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
