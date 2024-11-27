import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Books() {
  const { data: session } = useSession();
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [listError, setListError] = useState("");
  const [listSuccess, setListSuccess] = useState("");

  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [books, setBooks] = useState([]);
  const [bookError, setBookError] = useState("");
  const [bookSuccess, setBookSuccess] = useState("");

  // Fetch lists when the page loads or user session changes
  useEffect(() => {
    if (session?.user) {
      fetch("/api/lists")
        .then((res) => res.json())
        .then(setLists)
        .catch(console.error);
    }
  }, [session]);

  // Fetch books when a list is selected
  useEffect(() => {
    if (selectedListId) {
      fetch(`/api/books?list_id=${selectedListId}`)
        .then((res) => res.json())
        .then(setBooks)
        .catch(console.error);
    }
  }, [selectedListId]);

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
      setListSuccess("List created successfully!");
      setListName("");
    } else {
      const error = await res.json();
      setListError(error.message || "Failed to create list");
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedListId) {
      setBookError("Please select a list");
      return;
    }

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

    if (!res.ok) {
      const errorText = await res.text();
      try {
        const error = JSON.parse(errorText);
        setBookError(error.message || "Failed to add book");
      } catch (err) {
        setBookError("An unexpected error occurred while adding the book");
      }
      return;
    }

    const newBook = await res.json();
    setBooks((prev) => [...prev, newBook]); // Update the displayed books
    setBookSuccess("Book added successfully!");
    setBookTitle("");
    setBookAuthor("");
    setBookIsbn("");
  };

  return (
    <div>
      <h1>Book Management</h1>

      {/* Create List Section */}
      <section>
        <h2>Create a New List</h2>
        {listError && <p style={{ color: "red" }}>{listError}</p>}
        {listSuccess && <p style={{ color: "green" }}>{listSuccess}</p>}
        <form onSubmit={handleCreateList}>
          <div>
            <label>List Name:</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              required
            />
          </div>
          <button type="submit">Create List</button>
        </form>
      </section>

      {/* Add Book Section */}
      <section>
        <h2>Add a Book</h2>
        {bookError && <p style={{ color: "red" }}>{bookError}</p>}
        {bookSuccess && <p style={{ color: "green" }}>{bookSuccess}</p>}
        <form onSubmit={handleAddBook}>
          <div>
            <label>Select List:</label>
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              required
            >
              <option value="">Select a list</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Author:</label>
            <input
              type="text"
              value={bookAuthor}
              onChange={(e) => setBookAuthor(e.target.value)}
              required
            />
          </div>
          <div>
            <label>ISBN:</label>
            <input
              type="text"
              value={bookIsbn}
              onChange={(e) => setBookIsbn(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add Book</button>
        </form>
      </section>

      {/* Display Books for Selected List */}
      {selectedListId && (
        <section>
          <h2>Books in List</h2>
          <ul>
            {books.length > 0 ? (
              books.map((book) => (
                <li key={book.id}>
                  {book.title} by {book.author} (ISBN: {book.isbn})
                </li>
              ))
            ) : (
              <p>No books in this list.</p>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
