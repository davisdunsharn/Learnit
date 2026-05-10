const jwt = require('jsonwebtoken');
 
// slap this on any route that needs the user to be logged in
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
 
  // expecting "Bearer <token>" in the header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
 
  const token = authHeader.split(' ')[1];
 
  try {
    // verify decodes the token and gives us the payload we signed on login
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // attach user info to the request so controllers can use it
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
 
module.exports = authMiddleware;
 