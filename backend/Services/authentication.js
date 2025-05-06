const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn:"30d"});
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('error..............');
      return res.status(403).json({ exp: "Invalid or expired token" });
    }
    req.user = user.userId;
    next();
  });
};

module.exports = { generateToken, authenticateToken };