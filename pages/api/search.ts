import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open the SQLite database
const openDB = async () => {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    const db = await openDB();

    // Search for books matching the query in author_name or book_name
    const books = await db.all(
      `
      SELECT id, book_name, author_name, hyperlink, price
      FROM collected_books
      WHERE book_name LIKE ? OR author_name LIKE ?
      LIMIT 50
      `,
      [`%${query}%`, `%${query}%`]
    );

    return res.status(200).json({ books });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
