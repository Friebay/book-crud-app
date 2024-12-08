import { PrismaClient } from '@prisma/client'
import { getSession } from "next-auth/react"

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { method, query } = req;
  
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = parseInt(session.user.id);

  try {
    if (method === "POST") {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const list = await prisma.list.create({
        data: {
          userId,
          name
        }
      });
      
      return res.status(201).json(list);

    } else if (method === "GET") {
      const lists = await prisma.list.findMany({
        where: {
          userId
        },
        include: {
          books: true
        }
      });
      
      return res.status(200).json(lists);

    } else if (method === "PUT") {
      const { id, name } = req.body;
      
      if (!id || !name) {
        return res.status(400).json({ message: "ID and name are required" });
      }

      const list = await prisma.list.update({
        where: {
          id: parseInt(id),
          userId
        },
        data: {
          name
        }
      });
      
      return res.status(200).json(list);

    } else if (method === "DELETE") {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      await prisma.list.delete({
        where: {
          id: parseInt(id),
          userId
        }
      });
      
      return res.status(200).json({ message: "List deleted" });

    } else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Database operation failed", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}