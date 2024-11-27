import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open the SQLite database
const openDB = async () => {
  return open({
    filename: "./books.sqlite",
    driver: sqlite3.Database,
  });
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const db = await openDB();

    // Fetch 12 random books
    const randomBooks = await db.all(
      "SELECT id, book_name, author_name, hyperlink, price FROM books ORDER BY RANDOM() LIMIT 12"
    );

    // Fetch 3 latest books
    const latestBooks = await db.all(
      "SELECT id, book_name, author_name FROM books ORDER BY id DESC LIMIT 3"
    );

    return res.status(200).json({ randomBooks, latestBooks });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
