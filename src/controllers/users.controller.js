// controllers/authController.js
import { supabase } from "../lib/supabase.js";



// ------------------- REGISTER -------------------
export const register = async (req, res) => {
  const { full_name, email, phone, password, birth_date, profession } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }

  try {
    // 1️⃣ Créer l'utilisateur Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    const userId = authData.user.id;

    // 2️⃣ Créer le profil dans la table 'profiles'
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        full_name,
        email,
        phone: phone || null,
        birth_date: birth_date || null,
        profession: profession || null,
        type: "standard",
        accept_terms: true
      })
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ success: false, message: profileError.message });
    }

    // 3️⃣ Créer une session pour le frontend (login automatique)
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError || !sessionData.session) {
      return res.status(500).json({ success: false, message: "Impossible de générer le token" });
    }

    return res.status(201).json({
      success: true,
      token: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
      user: profileData
    });

  } catch (err) {
    console.error("Register catch error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }
};





// ------------------- LOGIN -------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
  }

  try {
    // 🔑 Connexion via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.session) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe invalide" });
    }

    const userId = data.user.id;

    // 🔗 Récupérer le profil lié
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, type, plan_id")
      .eq("id", userId)
      .single();

    if (profileError) {
      return res.status(404).json({ success: false, message: "Profil non trouvé" });
    }

    // 🔧 CORRECTION : Retourner le token et refreshToken au bon format
    res.json({
      success: true,
      token: data.session.access_token,  // Renommé de 'session' à 'token'
      refreshToken: data.session.refresh_token,
      user: profile
    });

  } catch (err) {
    console.error("Login catch error:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ------------------- GET CURRENT USER -------------------
export const me = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: "Aucun token fourni" 
      });
    }

    // Décodage du token avec Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ 
        success: false, 
        error: "Token invalide" 
      });
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, type, plan_id, created_at")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      return res.status(404).json({ 
        success: false, 
        error: "Profil non trouvé" 
      });
    }

    res.json({ 
      success: true, 
      user: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        type: profile.type,
        planId: profile.plan_id,
        createdAt: profile.created_at
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Erreur interne du serveur" 
    });
  }
};




export const upgradeUser = async (req, res) => {
  const { userId, planId } = req.body;

  // À protéger avec un middleware admin
  const { error } = await supabase
    .from("profiles")
    .update({ type: "premium", plan_id: planId })
    .eq("id", userId);

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({ success: true });
};


export const getUser = async (req, res) => {
    console.log('=== GET USER CALLED ===');
  console.log('Params:', req.params);
  console.log('Headers:', req.headers);
  
  const token = req.headers.authorization?.replace("Bearer ", "");
  console.log('Token present:', !!token);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false,
      message: "Token manquant" 
    });
  }


  const { data: auth, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ success: false });

  const requestedUserId = req.params.userId;

  if (auth.user.id !== requestedUserId) {
    return res.status(403).json({ success: false, message: "Accès interdit" });
  }

  const { data: user, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, birth_date, profession, type, plan_id")
    .eq("id", requestedUserId)
    .single();

  if (profileError) {
    return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
  }

  res.json({ success: true, user });
};

// ------------------- UPDATE USER -------------------
export const updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Token manquant" 
      });
    }

    // Vérifier l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      return res.status(401).json({ 
        success: false, 
        message: "Token invalide" 
      });
    }

    const userId = req.params.userId;
    
    // Vérifier que l'utilisateur met à jour son propre profil
    if (authData.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Accès interdit" 
      });
    }

    const { full_name, phone, address } = req.body;

    // Mise à jour du profil
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone,
        address
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(400).json({ 
        success: false, 
        message: "Échec de la mise à jour" 
      });
    }

    res.json({ 
      success: true, 
      user: updatedProfile,
      message: "Profil mis à jour avec succès"
    });

  } catch (error) {
    console.error('Update catch error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur" 
    });
  }
};

// ------------------- REFRESH TOKEN -------------------

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ success: false, message: "No refresh token" });

  const { data, error } = await supabase.auth.refreshSession(refreshToken);

  if (error) return res.status(401).json({ success: false, message: "Invalid refresh token" });

  // data.session.access_token et data.session.refresh_token
  res.json({
    success: true,
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: data.user
  });
};
