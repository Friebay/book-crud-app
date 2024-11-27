import db from "../../../db";

export default async function handler(req, res) {
  const { method, query } = req;

  if (method === "POST") {
    const { user_id, name } = req.body;
    const stmt = db.prepare(`INSERT INTO lists (user_id, name) VALUES (?, ?)`);
    stmt.run(user_id, name);
    stmt.finalize();
    res.status(201).json({ message: "List created" });
  } else if (method === "GET") {
    const stmt = db.prepare("SELECT * FROM lists WHERE user_id = ?");
    stmt.all(query.user_id, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(rows);
    });
  } else if (method === "PUT") {
    const { id, name } = req.body;
    const stmt = db.prepare(`UPDATE lists SET name = ? WHERE id = ?`);
    stmt.run(name, id);
    stmt.finalize();
    res.status(200).json({ message: "List updated" });
  } else if (method === "DELETE") {
    const { id } = req.body;
    const stmt = db.prepare(`DELETE FROM lists WHERE id = ?`);
    stmt.run(id);
    stmt.finalize();
    res.status(200).json({ message: "List deleted" });
  } else {
    res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
