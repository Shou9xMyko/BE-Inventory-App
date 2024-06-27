const jwt = require("jsonwebtoken");

// Middleware untuk memverifikasi token admin
const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      status: "error",
      status_code: 401,
      message: "Token diperlukan!",
    });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "token_expired",
          status_code: 401,
          message: "Token kadaluarsa",
        });
      }
      return res.status(401).json({
        status: "error",
        status_code: 401,
        message: "Token tidak valid!",
      });
    }
    next();
  });
};

module.exports = verifyToken;
