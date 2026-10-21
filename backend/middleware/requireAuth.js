const jwt = require("jsonwebtoken");
const User = require("../models/User");

const cookieName = "imovies_session";

function getSessionToken(request) {
  const authorization = request.get("Authorization") || "";
  const bearerMatch = /^Bearer\s+(.+)$/i.exec(authorization);
  return bearerMatch ? bearerMatch[1] : request.cookies?.[cookieName];
}

async function requireAuth(request, response, next) {
  const token = getSessionToken(request);
  if (!token) {
    return response.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email role").lean();
    if (!user) {
      return response.status(401).json({ message: "Your session is no longer valid. Please log in again." });
    }
    request.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return response.status(401).json({ message: "Your session has expired. Please log in again." });
    }
    next(error);
  }
}

function requireRole(...roles) {
  return function roleAuthorization(request, response, next) {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, cookieName, getSessionToken };
