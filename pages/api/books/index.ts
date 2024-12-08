import { getToken } from "next-auth/jwt";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = parseInt(token.id as string);


  try {
    if (req.method === "POST") {
      const { title, author, isbn, list_id } = req.body;

      if (!title || !author || !isbn || !list_id) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const book = await prisma.book.create({
        data: {
          title,
          author,
          isbn,
          listId: parseInt(list_id),
          userId
        }
      });

      return res.status(201).json(book);
    }

    if (req.method === "GET") {
      const { list_id } = req.query;

      if (!list_id) {
        return res.status(400).json({ message: "List ID is required" });
      }

      const books = await prisma.book.findMany({
        where: {
          listId: parseInt(list_id as string),
          userId
        }
      });

      return res.status(200).json(books);
    }

    if (req.method === "DELETE") {
      const { bookId } = req.query;

      if (!bookId) {
        return res.status(400).json({ error: "Book ID is required" });
      }

      await prisma.book.delete({
        where: {
          id: parseInt(bookId as string),
          userId
        }
      });

      return res.status(200).json({ message: "Book deleted successfully" });
    }

    if (req.method === "PUT") {
      const { bookId, title, author, isbn } = req.body;

      if (!bookId || !title || !author || !isbn) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const book = await prisma.book.update({
        where: {
          id: parseInt(bookId),
          userId
        },
        data: {
          title,
          author,
          isbn
        }
      });

      return res.status(200).json(book);
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database operation failed", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}