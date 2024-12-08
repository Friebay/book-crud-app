const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client')

const oldDb = new sqlite3.Database('./database.sqlite');
const prisma = new PrismaClient()

async function migrateData() {
  try {
    // Migrate Users
    oldDb.each("SELECT * FROM users", async (err, row) => {
      await prisma.user.create({
        data: {
          id: row.id,
          email: row.email,
          password: row.password
        }
      });
    });

    // Migrate Lists
    oldDb.each("SELECT * FROM lists", async (err, row) => {
      await prisma.list.create({
        data: {
          id: row.id,
          userId: row.user_id,
          name: row.name
        }
      });
    });

    // Migrate Books
    oldDb.each("SELECT * FROM books", async (err, row) => {
      await prisma.book.create({
        data: {
          id: row.id,
          listId: row.list_id,
          title: row.title,
          author: row.author,
          isbn: row.isbn
        }
      });
    });
  } catch (error) {
    console.error('Error migrating data:', error);
  }
}

migrateData()
  .then(() => console.log('Migration complete'))
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    oldDb.close()
  });