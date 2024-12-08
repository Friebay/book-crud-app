// Create verify-data.js
const { PrismaClient } = require('@prisma/client')
const sqlite3 = require('sqlite3').verbose()
const prisma = new PrismaClient()

async function verifyData() {
  // Connect to old SQLite database
  const oldDb = new sqlite3.Database('./database.sqlite')

  // Compare Users
  const sqliteUsers = await new Promise((resolve, reject) => {
    oldDb.all("SELECT id, email FROM users", (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })

  const postgresUsers = await prisma.user.findMany({
    select: { id: true, email: true }
  })

  console.log('--- Users Comparison ---')
  console.log('SQLite users:', sqliteUsers.length)
  console.log('Postgres users:', postgresUsers.length)
  
  // Compare counts and data
  const usersMatch = JSON.stringify(sqliteUsers.sort((a,b) => a.id - b.id)) === 
                     JSON.stringify(postgresUsers.sort((a,b) => a.id - b.id))
  
  console.log('Users match:', usersMatch)

  // Close connections
  oldDb.close()
  await prisma.$disconnect()
}

verifyData()
  .then(() => console.log('Verification complete'))
  .catch(console.error)