// controllers/advisorController.js
export const getGlobalAdvisor = async (req, res) => {
  try {
    // Retourne directement le JSON fixe
    const advisor = {
      id: 1,
      name: "Conseiller SmartMobile",
      phone_number: "+33123456789"
    };
    
    res.json(advisor);
  } catch (err) {
    console.error(err);
    // En cas d'erreur, retourne quand même le conseiller fixe
    res.json({
      id: 1,
      name: "Conseiller SmartMobile",
      phone_number: "+33123456789"
    });
  }
};