// controllers/notifications.controller.js
import pool from "../../db.js";

export const getNotifications = async (req, res) => {
const { user_id } = req.params;  
  if (!user_id) {
    return res.status(400).json({ message: 'user_id est requis' });
  } 

  try {
    const result = await pool.query(
      'SELECT * FROM "notification" WHERE "user_id" = $1 ORDER BY "created_at" DESC',
      [user_id]  
    );

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


export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params; // ID de la notification
  
  console.log(`Tentative de marquage comme lu pour la notification ID: ${id}`);
  
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID de la notification requis' 
    });
  }

  try {
    // Vérifier d'abord si la notification existe
    const checkResult = await pool.query(
      'SELECT * FROM "notification" WHERE "id" = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification non trouvée' 
      });
    }

    // Mettre à jour la notification
    const updateResult = await pool.query(
      `UPDATE "notification" 
       SET "is_read" = true, 
           "read_at" = CURRENT_TIMESTAMP 
       WHERE "id" = $1 
       RETURNING *`,
      [id]
    );

    console.log(`Notification ${id} marquée comme lue avec succès`);

    return res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      notification: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors du marquage comme lu:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du marquage de la notification comme lue',
      details: err.message
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  const { user_id } = req.body;
  
  console.log(`Tentative de marquage de toutes les notifications comme lues pour l'utilisateur: ${user_id}`);
  
  if (!user_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'user_id requis' 
    });
  }

  try {
    // Vérifier si l'utilisateur existe (optionnel)
    const userCheck = await pool.query(
      'SELECT id FROM "profiles" WHERE "id" = $1',
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Mettre à jour toutes les notifications non lues de l'utilisateur
    const updateResult = await pool.query(
      `UPDATE "notification" 
       SET "is_read" = true, 
           "read_at" = CURRENT_TIMESTAMP 
       WHERE "user_id" = $1 
         AND "is_read" = false 
       RETURNING *`,
      [user_id]
    );

    const updatedCount = updateResult.rows.length;
    console.log(`${updatedCount} notifications marquées comme lues pour l'utilisateur ${user_id}`);

    return res.status(200).json({
      success: true,
      message: `${updatedCount} notification(s) marquée(s) comme lue(s)`,
      count: updatedCount,
      notifications: updateResult.rows
    });
  } catch (err) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du marquage de toutes les notifications comme lues',
      details: err.message
    });
  }
};