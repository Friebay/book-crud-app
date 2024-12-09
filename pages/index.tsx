import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Sidebar from "../pages/components/Sidebar";


export default function Home() {
  const [randomBooks, setRandomBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [query, setQuery] = useState(""); // Search query
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { data: session } = useSession(); // Get session data
  const [timeLeft, setTimeLeft] = useState(60); // Timer starts at 60 seconds
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);


  // Function to fetch random and latest books
  async function fetchBooks() {
    try {
      const res = await fetch("/api/books/random-latest");
      if (res.ok) {
        const data = await res.json();
        setRandomBooks(data.randomBooks);
        setLatestBooks(data.latestBooks);
      } else {
        console.error("Failed to fetch books:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }

  useEffect(() => {
    // Function to calculate the time until the next full minute
    const calculateTimeLeft = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      return 60 - seconds; // Time until the next full minute
    };

    // Fetch books initially and sync timers
    fetchBooks(); // Initial fetch
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft); // Initialize countdown timer with calculated time

    // Start countdown timer immediately
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);

    // Schedule the first fetch at the next full minute
    const initialTimeout = setTimeout(() => {
      fetchBooks(); // Fetch books at the first full minute
      setTimeLeft(60); // Reset timer after fetching

      // Start fetching books every 60 seconds
      const updateInterval = setInterval(() => {
        fetchBooks();
      }, 60000);

      // Cleanup update interval when component unmounts
      return () => {
        clearInterval(updateInterval);
      };
    }, initialTimeLeft * 1000);

    // Cleanup both the countdown and initial timeout when the component unmounts
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(countdownInterval);
    };
  }, []);


  // Handle search functionality
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data.books);
    } else {
      setSearchResults([]);
    }

    setIsLoading(false);
  };

  

  return (
    <div className="container">
      <header>
        <h1>Sveiki atvykę į knygų katalogą!</h1>
        <nav className="header-nav">
          <Link href="/books">
            <button>Išsaugoti sąrašai</button>
          </Link>
          {!session ? (
            <>
              <Link href="/auth/register">
                <button>Registruotis</button>
              </Link>
              <Link href="/auth/login">
                <button>Prisijungti</button>
              </Link>
            </>
          ) : (
            <button onClick={() => signOut()}>Atsijungti</button>
          )}
        </nav>
      </header>

      <Sidebar />

      <main className="main">
        <section className="search-section">
          <h2>Ieškoti knygų</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Ieškoti pagal autorių arba knygos pavadinimą"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? "Ieškoma..." : "Ieškoti"}
            </button>
          </form>
        </section>

        {query ? (
          <section className="search-results">
            <h2>Paieškos rezultatai</h2>
            <div className="book-cards">
              {isLoading ? (
                <p>Krauname rezultatus...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((book) => (
                  <div className="book-card" key={book.id}>
                    <h3>{book.book_name}</h3>
                    <p>Autorius: {book.author_name}</p>
                    <a
                      href={book.hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pirkti už {book.price}
                    </a>
                  </div>
                ))
              ) : (
                <p>Neradome jokių rezultatų</p>
              )}
            </div>
          </section>
        ) : (
          <>
            <section>
              <h2>Atsitiktinės knygos</h2>
              <div className="book-cards">
                {randomBooks.map((book) => (
                  <div className="book-card" key={book.id}>
                    <h3>{book.book_name}</h3>
                    <p>Autorius: {book.author_name}</p>
                    <a
                      href={book.hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pirkti už {book.price}
                    </a>
                  </div>
                ))}
              </div>
            </section>


          </>
        )}
      </main>
      <aside className="latest-books">
        <h2>Naujausios knygos</h2>
        <p>Atsinaujins už {timeLeft} sekundžių...</p>
        <ul>
          {latestBooks.map((book) => (
            <li key={book.id}>
              <p><a
                href={book.hyperlink}
                target="_blank"
                rel="noopener noreferrer"
              >{book.book_name}</a></p>
              <small>Autorius: {book.author_name}<br />Radimo laikas: {book.found_time.substring(0, 16)}</small>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
