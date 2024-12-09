import { PrismaClient } from '@prisma/client';
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    console.log("Invalid method:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getToken({ req, secret });

    if (!token) {
      console.log("No token found. Unauthorized request.");
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!token.sub) {
      console.log("Invalid token: no sub field");
      return res.status(401).json({ message: "Invalid token" });
    }

    // Use token.sub instead of token.id for user identification
    const userId = parseInt(token.sub);

    if (isNaN(userId)) {
      console.log("Invalid user ID:", token.sub);
      return res.status(400).json({ message: "Invalid user ID" });
    }

    console.log("User ID from token:", userId);

    const userBooks = await prisma.book.findMany({
      where: {
        userId: userId
      },
      select: {
        title: true
      }
    });

    console.log("User books found:", userBooks);

    if (userBooks.length === 0) {
      console.log("No books found in the user's lists.");
      return res.status(200).json({ books: [] });
    }

    // Extract book names from the user's lists
    const bookNames = userBooks.map(book => book.title);
    console.log("Book names:", bookNames);

    const allLatestBooks = [];

    for (const bookName of bookNames) {
      console.log(`Searching for book: ${bookName}`);
      const latestBooks = await prisma.$queryRaw`
        SELECT * 
        FROM "collectedBook" 
        WHERE LOWER("book_name") = LOWER(${bookName}) 
        AND "found_time" IS NOT NULL
        ORDER BY "found_time" ASC
        LIMIT 10
      `;

      allLatestBooks.push(...(latestBooks as any[]));
    }

    console.log("Combined latest books matching user lists:", allLatestBooks);

    // Sort allLatestBooks by found_time descending
    allLatestBooks.sort((a, b) => new Date(b.found_time).getTime() - new Date(a.found_time).getTime());

    console.log("Sorted books by found_time (descending):", allLatestBooks);

    res.status(200).json({ books: allLatestBooks });
  } catch (error) {
    console.error("Error fetching user lists:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}