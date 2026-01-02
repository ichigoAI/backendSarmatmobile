// controllers/advisorController.js
export const getGlobalAdvisor = async (req, res) => {
  try {
    const advisor = {
      id: 1,
      name: "Conseiller SmartMobile",
      phone_number: "+2250709076379"
    };
    
    res.json(advisor);
  } catch (err) {
    console.error(err);
    res.json({
      id: 1,
      name: "Conseiller SmartMobile",
      phone_number: "+2250709076379"
    });
  }
};