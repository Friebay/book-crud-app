import { useEffect, useState } from "react";

function Sidebar() {
  const [latestBooks, setLatestBooks] = useState([]);

  useEffect(() => {
    async function fetchLatestBooks() {
      const res = await fetch("/api/user-lists/latest-books");
      if (res.ok) {
        const data = await res.json();
        setLatestBooks(data.books);
      } else {
        setLatestBooks([]);
      }
    }
    fetchLatestBooks();
  }, []);

  return (
    <aside className="sidebar">
      <h2>Latest books in your lists</h2>
      <ul>
        {latestBooks.length > 0 ? (
          latestBooks.map((book) => (
            <li key={book.id}>
              <a href={book.hyperlink}>
                <p>{book.book_name}</p>
              </a>
              <small>By {book.author_name}</small>
              <small><br />Found {book.found_time}</small>
            </li>
          ))
        ) : (
          <p>No matching books found in your lists.</p>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;
