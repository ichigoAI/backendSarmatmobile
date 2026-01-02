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
      .select("id, full_name, email, phone, type, plan_id, created_at") 
      .eq("id", userId)
      .single();

    if (profileError) {
      return res.status(404).json({ success: false, message: "Profil non trouvé" });
    }
    res.json({
      success: true,
      token: data.session.access_token, 
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



// ------------------- REFRESH TOKEN -------------------

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 1️⃣ Validation
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token manquant"
      });
    }

    // 2️⃣ Refresh auprès de Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data?.session) {
      console.warn("Refresh failed:", error?.message);

      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_INVALID",
        message: "Session expirée, reconnexion requise"
      });
    }

    const { access_token, refresh_token, expires_in } = data.session;

    // 3️⃣ (Optionnel mais recommandé) Recharger le user proprement
    const { data: userData, error: userError } =
      await supabase.auth.getUser(access_token);

    if (userError) {
      return res.status(401).json({
        success: false,
        code: "USER_FETCH_FAILED",
        message: "Utilisateur invalide après refresh"
      });
    }

    // 4️⃣ Réponse claire pour le mobile
    return res.json({
      success: true,
      token: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in, // utile côté mobile (debug)
      userId: userData.user.id
    });

  } catch (err) {
    console.error("Refresh crash:", err);

    return res.status(500).json({
      success: false,
      code: "REFRESH_SERVER_ERROR",
      message: "Erreur interne lors du refresh"
    });
  }
};


export const updateUser = async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[UPDATE USER ${requestId}] Début de la requête`);

  try {
    // ===== VALIDATION DU TOKEN =====
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      console.log(`[UPDATE USER ${requestId}] Token manquant`);
      return res.status(401).json({ 
        success: false, 
        message: "Authentification requise",
        code: "TOKEN_MISSING"
      });
    }

    // ===== VÉRIFICATION DE L'UTILISATEUR =====
    console.log(`[UPDATE USER ${requestId}] Vérification du token`);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error(`[UPDATE USER ${requestId}] Token invalide:`, authError.message);
      return res.status(401).json({ 
        success: false, 
        message: "Session expirée ou invalide",
        code: "TOKEN_INVALID"
      });
    }

    const authenticatedUserId = authData.user.id;
    const requestedUserId = req.params.userId;

    console.log(`[UPDATE USER ${requestId}] Auth userId: ${authenticatedUserId}, Requested userId: ${requestedUserId}`);

    // ===== VÉRIFICATION DES PERMISSIONS =====
    if (authenticatedUserId !== requestedUserId) {
      console.warn(`[UPDATE USER ${requestId}] Tentative d'accès non autorisé`);
      return res.status(403).json({ 
        success: false, 
        message: "Vous ne pouvez modifier que votre propre profil",
        code: "FORBIDDEN_ACCESS"
      });
    }

    // ===== VALIDATION DES DONNÉES =====
    const { full_name, phone, email } = req.body;
    
    console.log(`[UPDATE USER ${requestId}] Données reçues:`, { 
      full_name: full_name?.substring(0, 50) + (full_name?.length > 50 ? '...' : ''), 
      phone: phone ? 'présent' : 'absent',
      email: email ? 'présent' : 'absent'
    });

    const validationErrors = [];
    const updates = {};

    // Validation du nom complet
    if (full_name !== undefined) {
      const trimmedName = full_name?.trim();
      if (!trimmedName || trimmedName.length === 0) {
        validationErrors.push("Le nom complet ne peut pas être vide");
      } else if (trimmedName.length > 100) {
        validationErrors.push("Le nom complet ne peut pas dépasser 100 caractères");
      } else {
        updates.full_name = trimmedName;
      }
    }

    // Validation du téléphone
    if (phone !== undefined) {
      if (phone === null || phone === '') {
        updates.phone = null; // Permettre de supprimer le téléphone
      } else {
        const cleanedPhone = phone.replace(/\D/g, '');
        if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
          validationErrors.push("Le numéro de téléphone doit contenir entre 10 et 15 chiffres");
        } else {
          updates.phone = cleanedPhone;
        }
      }
    }

    // Validation de l'email (si fourni)
    if (email !== undefined && email !== null) {
      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!trimmedEmail || trimmedEmail.length === 0) {
        validationErrors.push("L'email ne peut pas être vide");
      } else if (!emailRegex.test(trimmedEmail)) {
        validationErrors.push("Format d'email invalide");
      } else if (trimmedEmail.length > 100) {
        validationErrors.push("L'email ne peut pas dépasser 100 caractères");
      } else {
        // Vérifier si l'email existe déjà pour un autre utilisateur
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', trimmedEmail)
          .neq('id', authenticatedUserId)
          .single();

        if (existingUser) {
          validationErrors.push("Cet email est déjà utilisé par un autre compte");
        } else {
          updates.email = trimmedEmail;
          
          // Si l'email change, on devra aussi mettre à jour l'utilisateur auth
          const { data: currentUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', authenticatedUserId)
            .single();
            
          if (currentUser?.email !== trimmedEmail) {
            updates.email_changed = true;
          }
        }
      }
    }

    // Retourner les erreurs de validation si présentes
    if (validationErrors.length > 0) {
      console.log(`[UPDATE USER ${requestId}] Erreurs de validation:`, validationErrors);
      return res.status(400).json({
        success: false,
        message: "Erreurs de validation",
        errors: validationErrors,
        code: "VALIDATION_ERROR"
      });
    }

    // Vérifier qu'il y a des mises à jour à effectuer
    if (Object.keys(updates).length === 0) {
      console.log(`[UPDATE USER ${requestId}] Aucune donnée à mettre à jour`);
      return res.status(400).json({
        success: false,
        message: "Aucune donnée à mettre à jour",
        code: "NO_UPDATES"
      });
    }

    // Ajouter la date de mise à jour
    updates.updated_at = new Date().toISOString();

    console.log(`[UPDATE USER ${requestId}] Mises à jour à appliquer:`, updates);

    // ===== MISE À JOUR DANS SUPABASE =====
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", authenticatedUserId)
      .select(`
        id,
        full_name,
        email,
        phone,
        type,
        plan_id,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error(`[UPDATE USER ${requestId}] Erreur Supabase:`, updateError);
      
      // Gestion des erreurs spécifiques Supabase
      if (updateError.code === '23505') {
        return res.status(409).json({
          success: false,
          message: "Un conflit de données est survenu",
          code: "DUPLICATE_ENTRY"
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la base de données",
        code: "DB_UPDATE_ERROR",
        details: updateError.message
      });
    }

    // ===== MISE À JOUR DE L'EMAIL DANS SUPABASE AUTH (si changé) =====
    if (updates.email_changed && updates.email) {
      try {
        console.log(`[UPDATE USER ${requestId}] Mise à jour de l'email dans Supabase Auth`);
        
        // Utiliser l'API admin de Supabase pour mettre à jour l'email
        // Note: Requiert le service_role key
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          authenticatedUserId,
          { email: updates.email }
        );
        
        if (authUpdateError) {
          console.warn(`[UPDATE USER ${requestId}] Impossible de mettre à jour l'email dans Auth:`, authUpdateError.message);
          // On continue car le profil est déjà mis à jour
        } else {
          console.log(`[UPDATE USER ${requestId}] Email mis à jour dans Auth avec succès`);
        }
      } catch (authError) {
        console.error(`[UPDATE USER ${requestId}] Erreur lors de la mise à jour Auth:`, authError);
      }
    }

    // ===== RÉPONSE =====
    const responseTime = Date.now() - startTime;
    console.log(`[UPDATE USER ${requestId}] Requête terminée avec succès en ${responseTime}ms`);

    res.json({ 
      success: true, 
      message: "Profil mis à jour avec succès",
      user: updatedProfile,
      updatedFields: Object.keys(updates).filter(key => !['updated_at', 'email_changed'].includes(key)),
      requestId,
      responseTime: `${responseTime}ms`
    });

  } catch (error) {
    console.error(`[UPDATE USER ${requestId}] Erreur inattendue:`, error);
    
    // Gestion des erreurs inattendues
    res.status(500).json({ 
      success: false, 
      message: "Une erreur inattendue est survenue",
      code: "UNEXPECTED_ERROR",
      requestId
    });
  }
};

/**
 * Version simplifiée pour des mises à jour rapides
 */
export const updateUserPartial = async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }

  try {
    // Vérification rapide du token
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError) throw new Error("Token invalide");

    const userId = req.params.userId;
    if (authData.user.id !== userId) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }

    // Nettoyer les données
    const updates = {};
    const { full_name, phone } = req.body;

    if (full_name !== undefined) {
      const trimmed = full_name?.trim();
      if (trimmed && trimmed.length > 0 && trimmed.length <= 100) {
        updates.full_name = trimmed;
      }
    }

    if (phone !== undefined) {
      updates.phone = phone ? phone.replace(/\D/g, '') : null;
    }

    // Vérifier s'il y a des mises à jour
    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, message: "Aucun changement", user: null });
    }

    updates.updated_at = new Date().toISOString();

    // Mise à jour
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select('id, full_name, email, phone, type')
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Profil mis à jour",
      user: data,
      updatedFields: Object.keys(updates).filter(key => key !== 'updated_at')
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};