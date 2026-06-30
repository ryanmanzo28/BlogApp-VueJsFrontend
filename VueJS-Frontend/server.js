import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
// this took me way too long to figure out for some reason but this just checks user credentials against the database and returns a JWT token if successful. The token is signed with a secret key that is stored in the .env file of the backend project. The token expires in 15 minutes. The server listens on port 3000 by default but can be changed with the SERVER_PORT environment variable.
// ive considered refactoring this file, but it works for now and im lazy.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../Blog-App-Backend/.env") });

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const BACKEND_API_BASE = process.env.BACKEND_API_BASE || "http://backend";
const BCRYPT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getBearerToken(req) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
        return "";
    }

    return authHeader.slice("Bearer ".length).trim();
}

function requireAuth(req, res, next) {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ error: "missing token" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    } catch (_error) {
        return res.status(401).json({ error: "invalid token" });
    }
}

function isBcryptHash(value) {
    return typeof value === "string" && value.startsWith("$2");
}

function verifyPassword(plainPassword, storedPassword) {
    if (typeof storedPassword !== "string") {
        return false;
    }

    if (isBcryptHash(storedPassword)) {
        return bcrypt.compareSync(plainPassword, storedPassword);
    }

    return plainPassword === storedPassword;
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || process.env.DATABASE_EXTERNAL_PORT || 3307),
    user: process.env.DB_USER || process.env.MARIADB_ROOT_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MARIADB_ROOT_PASSWORD || "password",
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "app",
    waitForConnections: true,
    connectionLimit: 10,
});

app.get("/api/db-health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: "Database connection failed" });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id, email, password FROM users WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1",
            [normalizedEmail],
        );

        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user || !verifyPassword(password, user.password)) {
            return res.status(401).json({ error: "invalid credentials" });
        }

        // If a legacy plaintext password exists, upgrade it to bcrypt at login.
        if (!isBcryptHash(user.password)) {
            const upgradedPassword = bcrypt.hashSync(password, BCRYPT_ROUNDS);
            await pool.query("UPDATE users SET password = ? WHERE id = ?", [upgradedPassword, user.id]);
        }

        await pool.query("UPDATE users SET modified = NOW() WHERE id = ?", [user.id]);

        const token = jwt.sign(
            { sub: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN },
        );

        return res.json({ token });
    } catch (_error) {
        return res.status(500).json({ error: "login failed" });
    }
});

app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body ?? {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    try {
        const [existing] = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
            [normalizedEmail],
        );

        if (Array.isArray(existing) && existing.length > 0) {
            return res.status(409).json({ error: "email already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, BCRYPT_ROUNDS);
        const [result] = await pool.query(
            "INSERT INTO users (email, password, role) VALUES (?, ?, 'user')",
            [normalizedEmail, hashedPassword],
        );

        const token = jwt.sign(
            { sub: result.insertId, email: normalizedEmail },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN },
        );

        return res.status(201).json({ token });
    } catch (error) {
        if (error && error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "email already exists" });
        }

        return res.status(500).json({ error: "signup failed" });
    }
});

app.get("/api/me", requireAuth, async (req, res) => {
    const userId = Number(req.user?.sub || 0);
    if (!userId) {
        return res.status(401).json({ error: "invalid token" });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id, email, role FROM users WHERE id = ? LIMIT 1",
            [userId],
        );

        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user) {
            return res.status(401).json({ error: "invalid token" });
        }

        return res.json({ user });
    } catch (_error) {
        return res.status(500).json({ error: "failed to load session" });
    }
});

app.get("/api/posts", async (_req, res) => {
    try {
        const response = await fetch(`${BACKEND_API_BASE}/posts`, {
            headers: { Accept: "application/json" },
        });

        if (!response.ok) {
            return res.status(response.status).json({ posts: [] });
        }

        const data = await response.json();
        return res.json({ posts: Array.isArray(data.posts) ? data.posts : [] });
    } catch (_error) {
        return res.status(502).json({ posts: [] });
    }
});

const distPath = path.resolve(__dirname, "dist");
const assetsPath = path.resolve(__dirname, "assets");
const loginPagePath = path.resolve(__dirname, "login.html");
const logoutPagePath = path.resolve(__dirname, "logout.html");
const signupPagePath = path.resolve(__dirname, "signup.html");
const writePagePath = path.resolve(__dirname, "write.html");
const articlePagePath = path.resolve(__dirname, "article.html");
const profilePagePath = path.resolve(__dirname, "profile.html");

app.get("/login", (_req, res) => {
    res.sendFile(loginPagePath);
});
app.get("/login.html", (_req, res) => {
    res.sendFile(loginPagePath);
});
app.get("/logout", (_req, res) => {
    res.sendFile(logoutPagePath);
});
app.get("/logout.html", (_req, res) => {
    res.sendFile(logoutPagePath);
});
app.get("/signup", (_req, res) => {
    res.sendFile(signupPagePath);
});
app.get("/signup.html", (_req, res) => {
    res.sendFile(signupPagePath);
});
app.get("/write.html", (_req, res) => {
    res.sendFile(writePagePath);
});
app.get("/article.html", (_req, res) => {
    res.sendFile(articlePagePath);
});
app.get("/profile.html", (_req, res) => {
    res.sendFile(profilePagePath);
});

app.use("/assets", express.static(assetsPath));
app.use(express.static(distPath));
app.get("/", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});
app.use((req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/assets")) {
        return res.status(404).end();
    }

    return res.redirect("/login");
});

const port = Number(process.env.SERVER_PORT || 3000);
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
