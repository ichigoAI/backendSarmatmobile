import express from "express";
import {
  getServices,
  getServiceDetails,
  addService,
  addServiceDetail,
  getServiceQuestions,
  addServiceQuestion,
  getServiceContent,
  addServiceContent
} from "../controllers/serviceController.js";

const router = express.Router();

// Routes pour les services
router.get("/services", getServices); 
router.get("/services/:id", getServiceDetails); 
// Routes pour les questions d'un service
router.get("/service-questions/:serviceId/", getServiceQuestions);

// Routes pour le contenu (logos partenaires) d'un service
router.get("/service-content/:serviceId/", getServiceContent); 






// Routes pour les services
router.post("/services", addService); // Ajouter un nouveau service

// Route pour ajouter les détails d'un service (sans serviceId dans l'URL)
router.post("/services/details", addServiceDetail); // Ajouter un détail de service

// Routes pour les questions d'un service
router.post("/services/:serviceId/questions", addServiceQuestion); // Ajouter une question à un service

router.post("/services/:serviceId/content", addServiceContent); // Ajouter un contenu (logo partenaire) à un service


export default router;
