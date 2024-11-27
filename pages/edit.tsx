import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function EditPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [lists, setLists] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");

  const [listName, setListName] = useState("");
  const [editingListId, setEditingListId] = useState(null);

  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [editingBookId, setEditingBookId] = useState(null);

  // Fetch lists
  useEffect(() => {
    if (session?.user) {
      fetch("/api/lists")
        .then((res) => res.json())
        .then(setLists)
        .catch(console.error);
    }
  }, [session]);

  // Fetch books
  useEffect(() => {
    if (selectedListId) {
      fetch(`/api/books?list_id=${selectedListId}`)
        .then((res) => res.json())
        .then(setBooks)
        .catch(console.error);
    }
  }, [selectedListId]);

  // Update list
  const handleUpdateList = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/lists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: editingListId, name: listName }),
    });
    if (res.ok) {
      setLists((prev) =>
        prev.map((list) => (list.id === editingListId ? { ...list, name: listName } : list))
      );
      setListName("");
      setEditingListId(null);
    }
  };

  // Update book
  const handleUpdateBook = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: editingBookId,
        title: bookTitle,
        author: bookAuthor,
        isbn: bookIsbn,
      }),
    });
    if (res.ok) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingBookId ? { ...book, title: bookTitle, author: bookAuthor, isbn: bookIsbn } : book
        )
      );
      setBookTitle("");
      setBookAuthor("");
      setBookIsbn("");
      setEditingBookId(null);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Edit Your Lists and Books</h1>
        <button onClick={() => signOut().then(() => router.push("/"))}>Log Out</button>
      </header>

      <aside className="sidebar">
        <h2>Your Lists</h2>
        <ul>
          {lists.map((list) => (
            <li key={list.id}>
              <button onClick={() => setSelectedListId(list.id)}>{list.name}</button>
              <button onClick={() => setEditingListId(list.id) || setListName(list.name)}>Edit</button>
            </li>
          ))}
        </ul>

        {editingListId && (
          <form onSubmit={handleUpdateList}>
            <input
              type="text"
              placeholder="New List Name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              required
            />
            <button type="submit">Update List</button>
          </form>
        )}
      </aside>

      <main>
        <h2>Books in Selected List</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <span>
                {book.title} by {book.author} (ISBN: {book.isbn})
              </span>
              <button onClick={() => setEditingBookId(book.id) || setBookTitle(book.title) || setBookAuthor(book.author) || setBookIsbn(book.isbn)}>Edit</button>
            </li>
          ))}
        </ul>

        {editingBookId && (
          <form onSubmit={handleUpdateBook}>
            <input
              type="text"
              placeholder="New Title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="New Author"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="New ISBN"
              value={bookIsbn}
              onChange={(e) => setBookIsbn(e.target.value)}
              required
            />
            <button type="submit">Update Book</button>
          </form>
        )}
      </main>
    </div>
  );
}
