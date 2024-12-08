import { PrismaClient } from '@prisma/client'
import { getSession } from "next-auth/react"

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { method, query } = req;
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (method === "POST") {
      const { list_id, title, author, isbn } = req.body;
      const book = await prisma.book.create({
        data: {
          listId: parseInt(list_id),
          userId: parseInt(session.user.id),
          title,
          author,
          isbn
        }
      });
      res.status(201).json(book);

    } else if (method === "GET") {
      const books = await prisma.book.findMany({
        where: {
          listId: parseInt(query.list_id),
          userId: parseInt(session.user.id)
        }
      });
      res.status(200).json(books);

    } else if (method === "PUT") {
      const { id, title, author, isbn } = req.body;
      const book = await prisma.book.update({
        where: {
          id: parseInt(id),
          userId: parseInt(session.user.id)
        },
        data: {
          title,
          author,
          isbn
        }
      });
      res.status(200).json(book);

    } else if (method === "DELETE") {
      const { id } = req.body;
      await prisma.book.delete({
        where: {
          id: parseInt(id),
          userId: parseInt(session.user.id)
        }
      });
      res.status(200).json({ message: "Book deleted" });

    } else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database operation failed" });
  }
}