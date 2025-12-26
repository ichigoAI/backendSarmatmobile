import { pool } from "../../db.js"; 
// Récupérer tous les services visibles
export const getServices = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM services WHERE is_visible = TRUE"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve services" });
  }
};

// Récupérer les détails d'un service spécifique
export const getServiceDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM service_details WHERE service_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Service details not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve service details" });
  }
};

// Ajouter un nouveau service
export const addService = async (req, res) => {
  const { title, description, icon, is_visible } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO services (title, description, icon, is_visible) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, icon, is_visible]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add service" });
  }
};

// Ajouter un nouveau détail de service
export const addServiceDetail = async (req, res) => {
  const { service_id, description, image_url} = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO service_details (service_id, description, image_url ) 
       VALUES ($1, $2, $3) RETURNING *`,
      [service_id, description, image_url, questions, logo_partenaire]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add service detail" });
  }
};



// Question 

 export const getServiceQuestions = async (req, res) => {
  const { serviceId } = req.params;

  try {
    // Si tu veux récupérer uniquement les questions visibles (is_visible = true), tu peux filtrer ici
    const result = await pool.query(
      "SELECT id, question FROM service_questions WHERE service_id = $1 AND is_visible = true",
      [serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucune question trouvée pour ce service ou aucune question visible." });
    }

    // Envoie les questions récupérées
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des questions du service:", err.message);
    res.status(500).json({ message: "Erreur lors de la récupération des questions du service" });
  }
};
// Ajouter une nouvelle question à un service
 export const addServiceQuestion = async (req, res) => {
  const { serviceId } = req.params;
  const { question, isVisible } = req.body; // Les données envoyées par le client

  // Validation des données
  if (!question || typeof question !== "string" || !isVisible) {
    return res.status(400).json({ message: "La question et la visibilité sont obligatoires" });
  }

  try {
    // Insérer la nouvelle question dans la base de données
    const result = await pool.query(
      "INSERT INTO service_questions (service_id, question, is_visible) VALUES ($1, $2, $3) RETURNING id, question, is_visible",
      [serviceId, question, isVisible]
    );

    // Retourner la question ajoutée avec son id généré
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout de la question:", err.message);
    res.status(500).json({ message: "Erreur lors de l'ajout de la question" });
  }
};

// Content 


// Récupérer le contenu (logos partenaires) d'un service
 export const getServiceContent = async (req, res) => {
  const { serviceId } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, logo_partenaire, is_visible FROM service_content WHERE service_id = $1 AND is_visible = true",
      [serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Aucun contenu trouvé pour ce service" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération du contenu du service:", err.message);
    res.status(500).json({ message: "Erreur lors de la récupération du contenu du service" });
  }
};

// Ajouter un nouveau contenu (logo partenaire) à un service
 export const addServiceContent = async (req, res) => {
  const { serviceId } = req.params;
  const { logoPartners, isVisible } = req.body;

  // Validation des données
  if (!logoPartners || typeof logoPartners !== "string" || !isVisible) {
    return res.status(400).json({ message: "Le logo et la visibilité sont obligatoires" });
  }

  try {
    // Insérer le nouveau contenu dans la base de données
    const result = await pool.query(
      "INSERT INTO service_content (service_id, logo_partners, is_visible) VALUES ($1, $2, $3) RETURNING id, logo_partners, is_visible",
      [serviceId, logoPartners, isVisible]
    );

    // Retourner le contenu ajouté avec son id généré
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout du contenu du service:", err.message);
    res.status(500).json({ message: "Erreur lors de l'ajout du contenu du service" });
  }
};



