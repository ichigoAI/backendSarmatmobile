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
router.get("/services", getServices); // Récupérer tous les services visibles
router.get("/services/:id", getServiceDetails); // Récupérer un service spécifique par ID
router.post("/services", addService); // Ajouter un nouveau service
router.post("/services/:serviceId/details", addServiceDetail); // Ajouter un détail de service

// Routes pour les questions d'un service
router.get("/service-questions/:serviceId/", getServiceQuestions); // Récupérer les questions d'un service
router.post("/service-questions/:serviceId/", addServiceQuestion); // Ajouter une question à un service

// Routes pour le contenu (logos partenaires) d'un service
router.get("/service-content/:serviceId/", getServiceContent); // Récupérer le contenu d'un service
router.post("/service-content/:serviceId/", addServiceContent); // Ajouter un contenu (logo partenaire) à un service

export default router;
