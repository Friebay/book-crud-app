import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";


const openDB = async () =>
  open({
    filename: "./database.sqlite", // Path to your SQLite database
    driver: sqlite3.Database,
  });

function isPasswordComplex(password: string): boolean {
  // Enforce password complexity rules
  const minLength = 12; // Recommended minimum length
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (!isPasswordComplex(password)) {
      return res.status(400).json({
        message: "Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters."
      });
    }

    const db = await openDB();

    // Check if the user already exists
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert the new user
    await db.run(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully." });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
