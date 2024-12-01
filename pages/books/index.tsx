import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Books() {
  const { data: session } = useSession();
  const router = useRouter();
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [books, setBooks] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");

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


  // Delete a book
  const handleDeleteBook = async (bookId) => {
    try {
      const res = await fetch(`/api/books?bookId=${bookId}`, { method: "DELETE" });
      if (res.ok) {
        setBooks((prev) => prev.filter((book) => book.id !== bookId));
      } else {
        // Handle error (optional)
        console.error("Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  // Delete a list
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
        // Handle error (optional)
        console.error("Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  // Create a new list
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: listName }),
    });
    if (res.ok) {
      const newList = await res.json();
      setLists((prev) => [...prev, newList]);
      setListName("");
    }
  };

  // Add a new book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  // Log out and redirect to the home page
  const handleLogout = async () => {
    await signOut({ redirect: false }); // Call signOut with redirect set to false
    router.push("/"); // Redirect to the home page after sign out
  };

  return (
    <div className="container-books">
      <header>
        <h1>Welcome, {session?.user?.name}</h1>
        <button onClick={handleLogout}>Log Out</button>
        <Link href="/">
          <button>Home</button>
        </Link>
      </header>
      <aside className="sidebar">
        <h2>Your Lists</h2>
        <ul>
          {lists.map((list) => (
            <li key={list.id} className="list-item">
              <button onClick={() => setSelectedListId(list.id)}>{list.name}</button>
              <button
                onClick={() => handleDeleteList(list.id)}
                className="delete-btn"
              >
                Delete List
              </button>
            </li>
          ))}
        </ul>

        <h3>Create New List</h3>
        <form onSubmit={handleCreateList}>
          <input
            type="text"
            placeholder="List Name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
      </aside>

      <main className="main">
        <h2>Add a Book</h2>
        <form onSubmit={handleAddBook}>
          <input
            type="text"
            placeholder="Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={bookAuthor}
            onChange={(e) => setBookAuthor(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="ISBN"
            value={bookIsbn}
            onChange={(e) => setBookIsbn(e.target.value)}
            required
          />
          <button type="submit" disabled={!selectedListId}>
            Add Book
          </button>
        </form>
      </main>

      <section className="books">
        <h2>Books in Selected List</h2>
        <ul>
          {books.map((book) => (
            <li key={book.id} className="book-item">
              <span>{book.title}</span> by {book.author} (ISBN: {book.isbn})
              <button
                onClick={() => handleDeleteBook(book.id)}
                className="delete-btn"
              >
                Delete Book
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
