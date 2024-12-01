import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ManagePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [books, setBooks] = useState([]);

  const [listName, setListName] = useState("");
  const [editingListId, setEditingListId] = useState(null);

  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [editingBookId, setEditingBookId] = useState(null);

  const [error, setError] = useState("");

  // Fetch lists
  useEffect(() => {
    if (session?.user) {
      fetch("/api/lists")
        .then((res) => res.json())
        .then(setLists)
        .catch(() => setError("Failed to fetch lists."));
    }
  }, [session]);

  // Fetch books
  useEffect(() => {
    if (selectedListId) {
      fetch(`/api/books?list_id=${selectedListId}`)
        .then((res) => res.json())
        .then(setBooks)
        .catch(() => setError("Failed to fetch books."));
    }
  }, [selectedListId]);

  // Handle list creation
  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName }),
      });
      if (res.ok) {
        const newList = await res.json();
        setLists((prev) => [...prev, newList]);
        setListName("");
      } else {
        throw new Error();
      }
    } catch {
      setError("Failed to create list.");
    }
  };

  // Handle list update
  const handleUpdateList = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: editingListId, name: listName }),
      });
      if (res.ok) {
        setLists((prev) =>
          prev.map((list) => (list.id === editingListId ? { ...list, name: listName } : list))
        );
        cancelListEditing();
      } else {
        throw new Error();
      }
    } catch {
      setError("Failed to update list.");
    }
  };

  // Handle list deletion
  const handleDeleteList = async (listId) => {
    try {
      const res = await fetch(`/api/lists?listId=${listId}`, { method: "DELETE" });
      if (res.ok) {
        setLists((prev) => prev.filter((list) => list.id !== listId));
        if (selectedListId === listId) {
          setSelectedListId("");
          setBooks([]);
        }
      } else {
        throw new Error();
      }
    } catch {
      setError("Failed to delete list.");
    }
  };

  // Handle book creation
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          list_id: selectedListId,
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
        }),
      });
      if (res.ok) {
        const newBook = await res.json();
        setBooks((prev) => [...prev, newBook]);
        setBookTitle("");
        setBookAuthor("");
        setBookIsbn("");
      } else {
        throw new Error();
      }
    } catch {
      setError("Failed to add book.");
    }
  };

  // Handle book update
  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
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
            book.id === editingBookId
              ? { ...book, title: bookTitle, author: bookAuthor, isbn: bookIsbn }
              : book
          )
        );
        cancelBookEditing();
      } else {
        throw new Error();
      }
    } catch {
      setError("Failed to update book.");
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId) => {
    try {
      const res = await fetch(`/api/books?bookId=${bookId}`, { method: "DELETE" });
      if (res.ok) {
        setBooks((prev) => prev.filter((book) => book.id !== bookId));
      } else {
        throw new Error();
      }
    } catch {
      setError("Failed to delete book.");
    }
  };

  // Cancel list editing
  const cancelListEditing = () => {
    setEditingListId(null);
    setListName("");
  };

  // Cancel book editing
  const cancelBookEditing = () => {
    setEditingBookId(null);
    setBookTitle("");
    setBookAuthor("");
    setBookIsbn("");
  };

  return (
    <div className="container-books">
      <header>
        <h1>Manage Your Lists and Books</h1>
        <button onClick={() => signOut().then(() => router.push("/"))}>Log Out</button>
        <Link href="/">
          <button>Home</button>
        </Link>
      </header>

      {error && <p className="error-message">{error}</p>}

      <aside className="sidebar">
        <h2>Your Lists</h2>
        <ul>
          {lists.map((list) => (
            <li key={list.id}>
              <button onClick={() => setSelectedListId(list.id)}>{list.name}</button>
              <button onClick={() => setEditingListId(list.id) || setListName(list.name)}>Edit</button>
              <button onClick={() => handleDeleteList(list.id)}>Delete</button>
            </li>
          ))}
        </ul>

        <form onSubmit={editingListId ? handleUpdateList : handleCreateList}>
          <input
            type="text"
            placeholder="List Name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            required
          />
          <button type="submit">{editingListId ? "Update List" : "Create List"}</button>
          {editingListId && <button type="button" onClick={cancelListEditing}>Cancel</button>}
        </form>
      </aside>

      <main>
        <h2>Books in Selected List</h2>
        {selectedListId && (
          <form onSubmit={editingBookId ? handleUpdateBook : handleAddBook}>
            <input
              type="text"
              placeholder="Book Title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Book Author"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Book ISBN"
              value={bookIsbn}
              onChange={(e) => setBookIsbn(e.target.value)}
              required
            />
            <button type="submit">{editingBookId ? "Update Book" : "Add Book"}</button>
            {editingBookId && <button type="button" onClick={cancelBookEditing}>Cancel</button>}
          </form>
        )}

        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <span>{book.title} by {book.author} (ISBN: {book.isbn})</span>
              <button onClick={() => setEditingBookId(book.id) || setBookTitle(book.title) || setBookAuthor(book.author) || setBookIsbn(book.isbn)}>
                Edit
              </button>
              <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
