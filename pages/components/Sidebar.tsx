import { useEffect, useState } from "react";

function Sidebar() {
  const [latestBooks, setLatestBooks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // Timer until next update

  // Fetch the latest books
  async function fetchLatestBooks() {
    try {
      const res = await fetch("/api/user-lists/latest-books");
      if (res.ok) {
        const data = await res.json();
        setLatestBooks(data.books);
      } else {
        setLatestBooks([]);
      }
    } catch (error) {
      console.error("Error fetching latest books:", error);
      setLatestBooks([]);
    }
  }

  useEffect(() => {
    // Function to calculate the time until the next full 60-second interval
    const calculateTimeLeft = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      return 60 - seconds; // Time until the next full minute
    };

    // Initial sync and fetch
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);
    fetchLatestBooks();

    // Schedule updates at every full 60-second interval
    const updateInterval = setInterval(() => {
      fetchLatestBooks();
    }, 60000); // Every 60 seconds

    // Timer for countdown until the next update
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <aside className="sidebar">
      <h2>Naujausios knygos jūsų sąrašuose</h2>
      <ul>
        {latestBooks.length > 0 ? (
          latestBooks.slice(0, 8).map((book) => ( // Show only the first 9 books
            <li key={book.id}>
              <a href={book.hyperlink}>
                <b>{book.book_name}</b>
              </a><br />
              <small>By {book.author_name}</small>
              <small>
                <br />
                Found {book.found_time.substring(0, 16)}
              </small>
            </li>
          ))
        ) : (
          <p>Knygų iš jūsų sąrašo neradome.</p>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;
