import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    try {
      // Search using Prisma with PostgreSQL ILIKE
      const books = await prisma.collectedBook.findMany({
        
        where: {
          OR: [
            {
              book_name: {
                contains: query as string,
                mode: 'insensitive'
              }
            },
            {
              author_name: {
                contains: query as string,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          book_name: true,
          author_name: true,
          hyperlink: true,
          price: true
        },
        take: 50
      });

      return res.status(200).json({ books });
    } catch (error) {
      console.error("Search error:", error);
      return res.status(500).json({ error: "Failed to search books" });
    } finally {
      await prisma.$disconnect();
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}