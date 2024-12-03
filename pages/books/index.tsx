import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

// Type definitions for better type safety
interface List {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  list_id: string;
}

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
        <h1>Tvarkykite savo sąrašus ir knygas</h1>
        <div className="header-nav">
          <Link href="/">
            <button>Pagrindinis</button>
          </Link>
          <Link href="/" onClick={async (e) => {
            e.preventDefault(); // Prevent the default link behavior
            await signOut(); // Call the sign-out function
            router.push("/"); // Navigate to the home page after signing out
          }}>
            <button>Atsijungti</button>
          </Link>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      <aside className="sidebar">
        <h2>Jūsų sąrašai</h2>
        <ul>
          {lists.map((list) => (
            <li key={list.id}>
              <button
                onClick={() => setSelectedListId(list.id)}
                className="btn-default"
              >
                {list.name}
              </button>
              <button
                onClick={() => setEditingListId(list.id) || setListName(list.name)}
                className="btn-update"
              >
                Redaguoti
              </button>
              <button
                onClick={() => handleDeleteList(list.id)}
                className="btn-delete"
              >
                Ištrinti
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={editingListId ? handleUpdateList : handleCreateList}>
          <input
            type="text"
            placeholder="Sąrašo pavadinimas"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            required
          />
          <button
            type="submit"
            className={editingListId ? "btn-update" : "btn-create"}
          >
            {editingListId ? "Atnaujinti sąrašą" : "Sukurti sąrašą"}
          </button>
          {editingListId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={cancelListEditing}
            >
              Cancel
            </button>
          )}
        </form>
      </aside>

      <style jsx>{`
  button {
    padding: 8px 16px;
    margin: 4px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-create {
    background-color: #4caf50; /* Green */
    color: white;
  }
  .btn-create:hover {
    background-color: #45a049;
  }
  .btn-update {
    background-color: #2196f3; /* Blue */
    color: white;
  }
  .btn-update:hover {
    background-color: #0b7dda;
  }
  .btn-cancel {
    background-color: #f44336; /* Red */
    color: white;
  }
  .btn-cancel:hover {
    background-color: #d32f2f;
  }
  .btn-delete {
    background-color: #ff9800; /* Orange */
    color: white;
  }
  .btn-delete:hover {
    background-color: #fb8c00;
  }
  .btn-default {
    background-color: #e0e0e0; /* Gray */
    color: black;
  }
  .btn-default:hover {
    background-color: #d5d5d5;
  }
`}</style>

      <main className="main">
        <h2>Knygos pasirinktame sąraše</h2>
        {selectedListId && (
          <form onSubmit={editingBookId ? handleUpdateBook : handleAddBook}>
          <input
            type="text"
            placeholder="Knygos pavadinimas"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Knygos autorius (neprivaloma)"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
          />
          <input
            type="text"
            placeholder="Knygos ISBN (neprivaloma)"
            value={bookIsbn}
            onChange={(e) => setBookIsbn(e.target.value)}
          />
          <button
            type="submit"
            className={editingBookId ? "btn-update" : "btn-create"}
          >
            {editingBookId ? "Atnaujinti knygą" : "Pridėti knygą"}
          </button>
          {editingBookId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={cancelBookEditing}
            >
              Atšaukti
            </button>
          )}
        </form>        
        )}

        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <span>
                {book.title}, autorius: {book.author} (ISBN: {book.isbn})
              </span>
              <button
                onClick={() =>
                  setEditingBookId(book.id) ||
                  setBookTitle(book.title) ||
                  setBookAuthor(book.author) ||
                  setBookIsbn(book.isbn)
                }
                className="btn-update"
              >
                Redaguoti
              </button>
              <button
                onClick={() => handleDeleteBook(book.id)}
                className="btn-delete"
              >
                Ištrinti
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
