import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getToken } from "next-auth/jwt";

// Helper function to open the database
async function openDatabase() {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
}

const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    console.log("Invalid method:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const token = await getToken({ req, secret });

  if (!token) {
    console.log("No token found. Unauthorized request.");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = token.id; // Retrieve user ID from token payload
  console.log("User ID from token:", userId);

  const db = await openDatabase();

  try {
    console.log("Fetching user book lists...");
    const userLists = await db.all(
      `SELECT title FROM books WHERE user_id = ?`,
      [userId]
    );

    console.log("User book lists fetched:", userLists);

    if (userLists.length === 0) {
      console.log("No books found in the user's lists.");
      return res.status(200).json({ books: [] });
    }

    // Extract book names from the user's lists
    const bookNames = userLists.map((list) => list.title);
    console.log("Book names extracted from user lists:", bookNames);

    const allLatestBooks = [];

    for (const bookName of bookNames) {
      console.log(`Searching for book: ${bookName}`);
      const latestBooks = await db.all(
        `SELECT * 
         FROM collected_books 
         WHERE LOWER(book_name) = LOWER(?) 
         LIMIT 10`,
        [bookName]
      );

      console.log(`Books found for '${bookName}':`, latestBooks);

      allLatestBooks.push(...latestBooks);
    }

    console.log("Combined latest books matching user lists:", allLatestBooks);

    res.status(200).json({ books: allLatestBooks });
  } catch (error) {
    console.error("Error fetching user lists:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    console.log("Closing database connection...");
    await db.close();
  }
}
