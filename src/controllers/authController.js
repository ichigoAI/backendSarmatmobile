// Ajoutez ce middleware pour logger les requêtes
export const logRequest = (req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
};