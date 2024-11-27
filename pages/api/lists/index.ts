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


  const userId = token.id; // Retrieve user ID from token payload

  if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "List name is required" });
    }

    const db = await openDB();
    const result = await db.run("INSERT INTO lists (user_id, name) VALUES (?, ?)", [
      userId,
      name,
    ]);

    return res.status(201).json({ id: result.lastID, name });
  }

  if (req.method === "GET") {
    const db = await openDB();
    const lists = await db.all("SELECT * FROM lists WHERE user_id = ?", [userId]);
    return res.status(200).json(lists);
  }

  if (req.method === "DELETE") {
    const { listId } = req.query;

    if (!listId) {
      return res.status(400).json({ error: "List ID is required" });
    }

    const db = await openDB();

    // Delete the list and its associated books
    await db.run("DELETE FROM books WHERE list_id = ? AND user_id = ?", [listId, userId]);
    await db.run("DELETE FROM lists WHERE id = ? AND user_id = ?", [listId, userId]);
    return res.status(200).json({ message: "List and associated books deleted successfully" });
  }

  if (req.method === "PUT") {
    const { listId, name } = req.body;
  
    if (!listId || !name) {
      return res.status(400).json({ error: "List ID and name are required" });
    }

    const db = await openDB();
  
    await db.run(
      "UPDATE lists SET name = ? WHERE id = ? AND user_id = ?",
      [name, listId, userId]
    );
  
    return res.status(200).json({ message: "List updated successfully" });
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
