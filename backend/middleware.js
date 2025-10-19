const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
};

const authenticateManager = (req, res, next) => {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Requires manager or admin role' });
    }
    next();
}

const authenticateAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Requires admin role' });
        }
        next();
    } catch (error) {
        // This will catch errors if req.user is not defined
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = { authenticateToken, authenticateManager, authenticateAdmin };