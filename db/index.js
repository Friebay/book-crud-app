const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Export prisma instance
module.exports = prisma