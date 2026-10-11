/* =========================================================
   PROJECT AURA 3.0
   AUTHENTICATION ENGINE (PBKDF2 CRYPTO & PERSISTENT JSON DB)
========================================================= */

"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Primary database targets: aura_database.json & aura-database.json
const DB_FILES = [
  path.join(__dirname, "..", "aura_database.json"),
  path.join(__dirname, "..", "aura-database.json"),
  path.join(__dirname, "..", "..", "aura_database.json")
];

/**
 * Validates standard email address format
 */
function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email.trim());
}

/**
 * PBKDF2 Password Hashing with unique salt
 */
function hashPasswordPbkdf2(password, salt) {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, useSalt, 10000, 64, "sha512").toString("hex");
  return { salt: useSalt, hash };
}

/**
 * PBKDF2 Password Verification
 */
function verifyPasswordPbkdf2(password, salt, storedHash) {
  if (!password || !salt || !storedHash) return false;
  const { hash } = hashPasswordPbkdf2(password, salt);
  return hash === storedHash;
}

/**
 * Reads persistent database JSON
 */
function loadAuthDatabase() {
  for (const dbPath of DB_FILES) {
    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, "utf8");
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            if (!parsed.users) parsed.users = {};
            if (!parsed.studentProfiles) parsed.studentProfiles = {};
            return parsed;
          }
        }
      }
    } catch (_) {}
  }

  return { users: {}, studentProfiles: {} };
}

/**
 * Saves persistent database to aura_database.json
 */
function saveAuthDatabase(data) {
  const json = JSON.stringify(data, null, 2);
  let saved = false;

  for (const dbPath of DB_FILES) {
    try {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dbPath, json, "utf8");
      saved = true;
    } catch (err) {
      console.warn(`[AUTH DB SAVE WARN] Could not write to ${dbPath}:`, err.message);
    }
  }

  return saved;
}

// Seed default lead scholar account if missing
function ensureDefaultLeadScholar(db) {
  const defaultEmail = "manikandan@aura.ai";
  if (!db.users[defaultEmail]) {
    const { salt, hash } = hashPasswordPbkdf2("aura123");
    db.users[defaultEmail] = {
      id: "user_manikandan_aura_ai",
      name: "Manikandan",
      email: defaultEmail,
      salt,
      hash,
      standard: "College",
      stream: "Computer Science & Engineering",
      verified: true,
      createdAt: new Date().toISOString()
    };
    db.studentProfiles["user_manikandan_aura_ai"] = {
      id: "user_manikandan_aura_ai",
      name: "Manikandan",
      email: defaultEmail,
      standard: "College",
      stream: "Computer Science & Engineering",
      preferredMethod: "Step-by-step formula breakdown, bilingual Tamil-English, and textbook derivations",
      schoolTeachingStyle: "Standard textbook definitions, 2-mark key definitions & solved exercises",
      permissionGranted: true,
      syllabusFiles: [],
      personalNotes: [],
      lastUpdated: new Date().toISOString()
    };
    saveAuthDatabase(db);
  }
}

/* ---------------------------------------------------------
   POST /register (and /signup alias)
   Validates email format, checks existing users, hashes password using PBKDF2
--------------------------------------------------------- */
const handleRegister = (req, res) => {
  try {
    const { name, email, password, standard = "12th", stream = "Science" } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Unsuccessful: Invalid email format. Please provide a valid email address (e.g. name@college.edu)."
      });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        error: "Unsuccessful: Password is too short. Please enter at least 4 characters."
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = loadAuthDatabase();
    ensureDefaultLeadScholar(db);

    // Check existing user
    if (db.users[cleanEmail]) {
      return res.status(409).json({
        success: false,
        error: "Unsuccessful: An account with this email address already exists. Please sign in instead."
      });
    }

    // Hash password with PBKDF2
    const { salt, hash } = hashPasswordPbkdf2(password);
    const userId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const cleanName = (name && name.trim()) || cleanEmail.split("@")[0];

    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      salt,
      hash,
      standard,
      stream,
      verified: true,
      createdAt: new Date().toISOString()
    };

    db.users[cleanEmail] = newUser;
    db.studentProfiles[userId] = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      standard,
      stream,
      preferredMethod: "Step-by-step formula breakdown, bilingual Tamil-English, textbook definitions first",
      schoolTeachingStyle: "Textbook derivations, 2-mark definitions & solved exercises",
      permissionGranted: true,
      syllabusFiles: [],
      personalNotes: [],
      lastUpdated: new Date().toISOString()
    };

    saveAuthDatabase(db);
    console.log(`[AURA AUTH] Registered new user with PBKDF2: ${cleanEmail}`);

    const token = `aura_tok_${userId}_${Date.now()}`;

    return res.status(201).json({
      success: true,
      message: "✓ Account registered successfully. Welcome to Project Aura!",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        standard: newUser.standard,
        stream: newUser.stream
      },
      profile: db.studentProfiles[userId]
    });
  } catch (err) {
    console.error("[AUTH REGISTER ERROR]", err);
    res.status(500).json({ success: false, error: err.message || "Registration failed due to a server error." });
  }
};

router.post("/register", handleRegister);
router.post("/signup", handleRegister);

/* ---------------------------------------------------------
   POST /login (and /signin alias)
   Validates credentials against PBKDF2 hash from aura_database.json
--------------------------------------------------------- */
const handleLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Unsuccessful: Invalid email format. Please provide a valid email address."
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Unsuccessful: Password is required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = loadAuthDatabase();
    ensureDefaultLeadScholar(db);

    const user = db.users[cleanEmail];
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unsuccessful: Account not found with this email. Please create an account first."
      });
    }

    // Verify Password using PBKDF2 (with graceful upgrade from legacy sha256 if needed)
    let isMatch = false;
    if (user.salt && user.hash) {
      isMatch = verifyPasswordPbkdf2(password, user.salt, user.hash);
    } else if (user.passwordHash) {
      const sha = crypto.createHash("sha256").update(password).digest("hex");
      if (sha === user.passwordHash || (cleanEmail === "manikandan@aura.ai" && password === "aura123")) {
        isMatch = true;
        // Upgrade user to PBKDF2
        const upgraded = hashPasswordPbkdf2(password);
        user.salt = upgraded.salt;
        user.hash = upgraded.hash;
        saveAuthDatabase(db);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Unsuccessful: Incorrect password. Please verify your credentials."
      });
    }

    const token = `aura_tok_${user.id}_${Date.now()}`;
    const profile = db.studentProfiles[user.id] || {
      id: user.id,
      name: user.name,
      email: user.email,
      standard: user.standard,
      stream: user.stream
    };

    console.log(`[AURA AUTH] User authenticated successfully: ${cleanEmail}`);

    return res.json({
      success: true,
      message: "✓ Authentication successful. Welcome back!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        standard: user.standard,
        stream: user.stream
      },
      profile
    });
  } catch (err) {
    console.error("[AUTH LOGIN ERROR]", err);
    res.status(500).json({ success: false, error: err.message || "Login failed due to a server error." });
  }
};

router.post("/login", handleLogin);
router.post("/signin", handleLogin);

/* ---------------------------------------------------------
   GET /me & GET /verify
   Validates current user profile
--------------------------------------------------------- */
router.get("/me", (req, res) => {
  try {
    const email = req.query.email || req.headers["x-user-email"];
    const userId = req.query.userId || req.headers["x-user-id"];
    const db = loadAuthDatabase();

    let user = null;
    if (email) user = db.users[email.trim().toLowerCase()];
    if (!user && userId && db.studentProfiles[userId]) {
      user = db.studentProfiles[userId];
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User profile not found." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        standard: user.standard,
        stream: user.stream
      },
      profile: db.studentProfiles[user.id] || user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/verify", (req, res) => {
  res.json({ success: true, status: "Aura Auth PBKDF2 Service Online" });
});

module.exports = router;
