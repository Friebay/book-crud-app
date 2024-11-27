import { getToken } from "next-auth/jwt";
import sqlite3 from "sqlite3";
import { open } from "sqlite";


const openDB = async () =>
  open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });
  

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  

  const userId = token.id; // Get user ID from the token

  if (req.method === "POST") {
    const { title, author, isbn, list_id } = req.body;

    if (!title || !author || !isbn || !list_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = await openDB();

    try {
      // Insert the book into the database
      const result = await db.run(
        "INSERT INTO books (title, author, isbn, list_id, user_id) VALUES (?, ?, ?, ?, ?)",
        [title, author, isbn, list_id, userId]
      );

      return res.status(201).json({ id: result.lastID, title, author, isbn, list_id });
    } catch (error) {
      return res.status(500).json({ message: "Error adding book to list", error });
    }
  }

  if (req.method === "GET") {
    const { list_id } = req.query;

    if (!list_id) {
      return res.status(400).json({ message: "List ID is required" });
    }

    const db = await openDB();
    const books = await db.all("SELECT * FROM books WHERE list_id = ? AND user_id = ?", [
      list_id,
      userId,
    ]);

    return res.status(200).json(books);
  }

  if (req.method === "DELETE") {
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({ error: "Book ID is required" });
    }
    
    const db = await openDB();

    await db.run("DELETE FROM books WHERE id = ? AND user_id = ?", [bookId, userId]);
    return res.status(200).json({ message: "Book deleted successfully" });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
