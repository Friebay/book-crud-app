import db from "../../../db";

export default async function handler(req, res) {
  const { method, query } = req;

  if (method === "POST") {
    const { list_id, title, author, isbn } = req.body;
    const stmt = db.prepare(
      `INSERT INTO books (list_id, title, author, isbn) VALUES (?, ?, ?, ?)`
    );
    stmt.run(list_id, title, author, isbn);
    stmt.finalize();
    res.status(201).json({ message: "Book added" });
  } else if (method === "GET") {
    const stmt = db.prepare("SELECT * FROM books WHERE list_id = ?");
    stmt.all(query.list_id, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(rows);
    });
  } else if (method === "PUT") {
    const { id, title, author, isbn } = req.body;
    const stmt = db.prepare(
      `UPDATE books SET title = ?, author = ?, isbn = ? WHERE id = ?`
    );
    stmt.run(title, author, isbn, id);
    stmt.finalize();
    res.status(200).json({ message: "Book updated" });
  } else if (method === "DELETE") {
    const { id } = req.body;
    const stmt = db.prepare(`DELETE FROM books WHERE id = ?`);
    stmt.run(id);
    stmt.finalize();
    res.status(200).json({ message: "Book deleted" });
  } else {
    res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
