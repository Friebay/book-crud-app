import bcrypt from "bcryptjs";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function isPasswordComplex(password: string): boolean {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Būtinas el. pašto adresas ir slaptažodis." });
      }

      if (!isPasswordComplex(password)) {
        return res.status(400).json({
          message: "Slaptažodis turi būti ne trumpesnis nei 12 simbolių, jame turi būti didžiosios ir mažosios raidės, skaičiai ir specialieji simboliai."
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: "Toks el. pašto adresas jau užregistruotas." });
      }

      // Hash password and create user
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          provider: 'credentials',
          provider_account_id: null
        }
      });

      res.status(201).json({
        message: "Paskyra sėkmingai sukurta.",
        userId: user.id
      });

    } catch (error) {
      console.error('Regsitracijos klaida: ', error);
      res.status(500).json({ message: "Klaida kuriant paskyą" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}