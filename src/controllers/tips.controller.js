import pool from "../../db.js";

export const getTips = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, description FROM tips WHERE visible = TRUE ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tips" });
  }
};


// Ajouter un nouveau tip
export const addTip = async (req, res) => {
  const { desc, visible } = req.body;

  if (!desc) {
    return res.status(400).json({ message: "Description requise" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tips (desc, visible) VALUES ($1, $2) RETURNING *",
      [desc, visible ?? true] // visible par défaut à true
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du tip" });
  }
};

// Mettre à jour un tip
export const updateTip = async (req, res) => {
  const { id } = req.params;
  const { desc, visible } = req.body;

  try {
    const result = await pool.query(
      "UPDATE tips SET desc = $1, visible = $2 WHERE id = $3 RETURNING *",
      [desc, visible, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tip non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du tip" });
  }
};

// Supprimer un tip
export const deleteTip = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tips WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tip non trouvé" });
    }

    res.json({ message: "Tip supprimé avec succès", tip: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du tip" });
  }
};