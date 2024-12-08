import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Fetch 24 random books using PostgreSQL's RANDOM()
      const randomBooks = await prisma.$queryRaw`
        SELECT id, book_name, author_name, hyperlink, price 
        FROM "CollectedBook" 
        ORDER BY RANDOM() 
        LIMIT 24
      `;

      // Fetch 10 latest books
      const latestBooks = await prisma.collectedBook.findMany({
        select: {
          id: true,
          book_name: true,
          author_name: true,
          found_time: true,
          hyperlink: true
        },
        orderBy: {
          id: 'desc'
        },
        take: 10
      });

      return res.status(200).json({ randomBooks, latestBooks });

    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Failed to fetch books" });
    } finally {
      await prisma.$disconnect();
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}