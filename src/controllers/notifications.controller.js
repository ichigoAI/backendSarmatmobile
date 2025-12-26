// controllers/notifications.controller.js
import pool from "../../db.js";

// Fonction pour récupérer les notifications d'un utilisateur
export const getNotifications = async (req, res) => {
  const { user_id } = req.params;  // Récupérer l'ID de l'utilisateur dans les paramètres de la route

  try {
    // Effectuer la requête SQL pour récupérer les notifications de la base de données
    const result = await pool.query(
      'SELECT * FROM "notification" WHERE "user_id" = $1 ORDER BY "created_at" DESC',
      [user_id]  
    );

    // Si aucune notification n'a été trouvée
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Aucune notification trouvée pour cet utilisateur.' });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des notifications' });
  }
};


// Ajouter une nouvelle notification
export const addNotification = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message requis" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO notifications (message) VALUES ($1) RETURNING *",
      [message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout de la notification:", err.message);
    res.status(500).json({ message: "Erreur lors de l'ajout de la notification" });
  }
};
