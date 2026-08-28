const jwt = require("jsonwebtoken");
const { User } = require("../models/users.model");
const { admin } = require("../models/AdminUser.model");

const verifyToken = async (req, res, next) => {
  try {
    const models = {
      user: User,
      Admin: admin,
      super_admin: admin,
    };

    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = tokenHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Malformed token" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    const { id, role } = decoded;

    console.log({decoded});
    const Model = models[role];
    console.log({Model});
    

    if (!Model) {
      return res.status(500).json({ message: "Invalid role in token" });
    }

    const user = await Model.findById(id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req[role] = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

module.exports = { verifyToken };
