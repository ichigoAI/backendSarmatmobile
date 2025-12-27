// controller.js
import pool  from "../../db.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const getPlans = async (req, res) => {
  try {
    // Récupérer les plans depuis la base de données
    const result = await pool.query('SELECT * FROM plans'); // Remplace par ta propre requête SQL
    res.json(result.rows); // Retourner les plans récupérés
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des plans', error: err.message });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    // Récupérer les méthodes de paiement depuis la base de données
    const result = await pool.query('SELECT * FROM payment_methods'); // Remplace par ta propre requête SQL
    res.json(result.rows); // Retourner les méthodes de paiement récupérées
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des méthodes de paiement', error: err.message });
  }
};


export const createCheckoutSession = async (req, res) => {
  const { productName, price } = req.body;  

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      line_items: [
        {
          price_data: {
            currency: 'usd',  
            product_data: {
              name: productName,
            },
            unit_amount: price * 100,  
          },
          quantity: 1,  
        },
      ],
      mode: 'payment',  
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,  // URL de succès
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,  
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};