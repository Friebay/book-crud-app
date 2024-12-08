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
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "List name is required" });
      }

      const list = await prisma.list.create({
        data: {
          userId,
          name
        }
      });

      return res.status(201).json(list);
    }

    if (req.method === "GET") {
      const lists = await prisma.list.findMany({
        where: {
          userId
        },
        include: {
          books: true
        }
      });
      return res.status(200).json(lists);
    }

    if (req.method === "DELETE") {
      const { listId } = req.query;

      if (!listId) {
        return res.status(400).json({ error: "List ID is required" });
      }

      // Use transaction to delete list and associated books
      await prisma.$transaction([
        prisma.book.deleteMany({
          where: {
            listId: parseInt(listId as string),
            userId
          }
        }),
        prisma.list.delete({
          where: {
            id: parseInt(listId as string),
            userId
          }
        })
      ]);

      return res.status(200).json({ message: "List and associated books deleted successfully" });
    }

    if (req.method === "PUT") {
      const { listId, name } = req.body;

      if (!listId || !name) {
        return res.status(400).json({ error: "List ID and name are required" });
      }

      const list = await prisma.list.update({
        where: {
          id: parseInt(listId),
          userId
        },
        data: {
          name
        }
      });

      return res.status(200).json(list);
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