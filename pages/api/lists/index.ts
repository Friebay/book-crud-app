import { PrismaClient } from '@prisma/client'
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      console.error("Token not found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Token retrieved:", token);

    // Check the structure of the token and retrieve the user ID accordingly
    let userId;
    if (token.id) {
      userId = parseInt(token.id as string);
    } else if (token.sub) {
      userId = parseInt(token.sub);
    } else {
      console.error("User ID not found in token");
      return res.status(400).json({ message: "User ID not found in token" });
    }

    if (isNaN(userId)) {
      console.error("Invalid user ID in token");
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (req.method === "POST") {
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

    } else if (req.method === "GET") {
      const lists = await prisma.list.findMany({
        where: {
          userId
        },
        include: {
          books: true
        }
      });

      return res.status(200).json(lists);

    } else if (req.method === "PUT") {
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

    } else if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      await prisma.$transaction([
        prisma.book.deleteMany({
          where: {
            listId: parseInt(id),
            userId
          }
        }),
        prisma.list.delete({
          where: {
            id: parseInt(id),
            userId
          }
        })
      ]);

      return res.status(200).json({ message: "List and associated books deleted" });

    } else {
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      message: "Database operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}