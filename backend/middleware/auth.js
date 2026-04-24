const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'vap_lemeux_secret_key_2024';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  try {
    req.admin = jwt.verify(auth.split(' ')[1], SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
