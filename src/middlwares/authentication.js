const jwt = require("jsonwebtoken");
const { User } = require("../models/users.model");
const { admin } = require("../models/AdminUser.model");

const verifyToken = async (req, res, next) => {
  try {
    const models = {
      user: User,
      User: User,
      admin: admin,
      Admin: admin,
      super_admin: admin,
      manager: admin,
      employee: admin,
      support: admin,
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

    const normalizedRole = (role || "").toLowerCase();
    const Model =
      models[role] ||
      models[normalizedRole] ||
      (normalizedRole.includes("admin") ? admin : User);

    if (!Model) {
      return res.status(401).json({ message: "Invalid role in token" });
    }

    const user = await Model.findById(id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req[role] = user;
    if (normalizedRole.includes("admin") || Model === admin) {
      req.Admin = user;
      req.admin = user;
      req.super_admin = user;
    } else {
      req.user = user;
      req.User = user;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

const requireProductManager = (req, res, next) => {
  const adminUser = req.Admin || req.super_admin;

  if (!adminUser) {
    return res.status(403).json({ message: "Admin access is required" });
  }

  const isSuperAdmin =
    adminUser.userRole === "super_admin" ||
    String(adminUser.role).toLowerCase() === "super_admin";

  if (!isSuperAdmin && !adminUser.permissions?.products) {
    return res
      .status(403)
      .json({ message: "You do not have permission to manage products" });
  }

  next();
};

module.exports = { verifyToken, requireProductManager };
