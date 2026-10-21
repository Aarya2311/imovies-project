const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { cookieName, getSessionToken } = require("../middleware/requireAuth");

const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationMs,
  };
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || "customer",
  };
}

function issueSession(user, response) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in the backend environment.");
  }
  const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: "7d",
  });
  response.cookie(cookieName, token, sessionCookieOptions());
  return { user: publicUser(user), token };
}

function validateCredentials({ name, email, password }, requireName) {
  if (requireName && (typeof name !== "string" || !name.trim())) {
    return "Your name is required.";
  }
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return "Enter a valid email address.";
  }
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return "Password must be at least 8 characters and no more than 72 UTF-8 bytes.";
  }
  return null;
}

async function register(request, response, next) {
  try {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const validationError = validateCredentials(body, true);
    if (validationError) {
      return response.status(400).json({ message: validationError });
    }

    const email = body.email.trim().toLowerCase();
    const existingUser = await User.exists({ email });
    if (existingUser) {
      return response.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      name: body.name.trim(),
      email,
      passwordHash,
      role: "customer",
    });

    response.status(201).json(issueSession(user, response));
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: "An account with that email already exists." });
    }
    next(error);
  }
}

async function login(request, response, next) {
  try {
    const body = request.body && typeof request.body === "object" ? request.body : {};
    const validationError = validateCredentials(body, false);
    if (validationError) {
      return response.status(400).json({ message: validationError });
    }

    const user = await User.findOne({ email: body.email.trim().toLowerCase() })
      .select("+passwordHash");
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return response.status(401).json({ message: "Email or password is incorrect." });
    }

    response.json(issueSession(user, response));
  } catch (error) {
    next(error);
  }
}

async function currentUser(request, response, next) {
  try {
    const token = getSessionToken(request);
    if (!token) {
      return response.json({ user: null });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email role").lean();
    if (!user) {
      response.clearCookie(cookieName, sessionCookieOptions());
      return response.json({ user: null });
    }
    response.json({ user: publicUser(user) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      response.clearCookie(cookieName, sessionCookieOptions());
      return response.json({ user: null });
    }
    next(error);
  }
}

function logout(_request, response) {
  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions();
  response.clearCookie(cookieName, clearOptions);
  response.status(204).end();
}

module.exports = { register, login, currentUser, logout };
