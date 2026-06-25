import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
// this took me way too long to figure out for some reason but this just checks user credentials against the database and returns a JWT token if successful. The token is signed with a secret key that is stored in the .env file of the backend project. The token expires in 15 minutes. The server listens on port 3000 by default but can be changed with the SERVER_PORT environment variable.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../Blog-App-Backend/.env") });

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function verifyPassword(plainPassword, storedPassword) {
    if (typeof storedPassword !== "string") {
        return false;
    }

    if (storedPassword.startsWith("$2")) {
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

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id, email, password FROM users WHERE email = ? LIMIT 1",
            [email],
        );

        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user || !verifyPassword(password, user.password)) {
            return res.status(401).json({ error: "invalid credentials" });
        }

        const token = jwt.sign(
            { sub: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "15m" },
        );

        return res.json({ token });
    } catch (_error) {
        return res.status(500).json({ error: "login failed" });
    }
});

const distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));
app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

const port = Number(process.env.SERVER_PORT || 3000);
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});