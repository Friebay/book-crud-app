import { PrismaClient } from '@prisma/client';
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
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

  const userId = parseInt(token.id as string);
  console.log("User ID from token:", userId);

  try {
    console.log("Fetching user book lists...");
    const userBooks = await prisma.book.findMany({
      where: {
        userId: userId
      },
      select: {
        title: true
      }
    });

    console.log("User book lists fetched:", userBooks);

    if (userBooks.length === 0) {
      console.log("No books found in the user's lists.");
      return res.status(200).json({ books: [] });
    }

    // Extract book names from the user's lists
    const bookNames = userBooks.map(book => book.title);

    // Fetch latest books using Prisma
    const latestBooks = await prisma.collectedBook.findMany({
      where: {
        book_name: {
          in: bookNames.map(name => name.toLowerCase())
        },
        NOT: {
          found_time: null
        }
      },
      orderBy: {
        found_time: 'desc'
      },
      take: 10 * bookNames.length // Fetch 10 books per user book
    });

    // Sort by found_time descending
    const sortedBooks = latestBooks.sort((a, b) => 
      new Date(b.found_time).getTime() - new Date(a.found_time).getTime()
    );

    res.status(200).json({ books: sortedBooks });
  } catch (error) {
    console.error("Error fetching user lists:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}