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

  // Fetch random and latest books
  useEffect(() => {
    async function fetchBooks() {
      const res = await fetch("/api/books/random-latest");
      if (res.ok) {
        const data = await res.json();
        setRandomBooks(data.randomBooks);
        setLatestBooks(data.latestBooks);
      }
    }
    fetchBooks();
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
        <h1>Welcome to the Book List App</h1>
        <nav className="header-nav">
          <Link href="/">
            <button>Home</button>
          </Link>
          <Link href="/books">
            <button>Saved Lists</button>
          </Link>
          {!session ? (
            <>
              <Link href="/auth/register">
                <button>Register</button>
              </Link>
              <Link href="/auth/login">
                <button>Log In</button>
              </Link>
            </>
          ) : (
            <button onClick={() => signOut()}>Log Out</button>
          )}
        </nav>
      </header>

      {/* Use the Sidebar Component */}
      <Sidebar />

      <main className="main">
        <section className="search-section">
          <h2>Search Books</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by author or book name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        </section>

        {query ? (
          <section className="search-results">
            <h2>Search Results</h2>
            <div className="book-cards">
              {isLoading ? (
                <p>Loading results...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((book) => (
                  <div className="book-card" key={book.id}>
                    <h3>{book.book_name}</h3>
                    <p>By {book.author_name}</p>
                    <a
                      href={book.hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy for ${book.price}
                    </a>
                  </div>
                ))
              ) : (
                <p>No results found</p>
              )}
            </div>
          </section>
        ) : (
          <>
            <section>
              <h2>Recommended Books</h2>
              <div className="book-cards">
                {randomBooks.map((book) => (
                  <div className="book-card" key={book.id}>
                    <h3>{book.book_name}</h3>
                    <p>By {book.author_name}</p>
                    <a
                      href={book.hyperlink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy for ${book.price}
                    </a>
                  </div>
                ))}
              </div>
            </section>


          </>
        )}
      </main>
      <aside className="latest-books">
        <h2>Latest Books</h2>
        <ul>
          {latestBooks.map((book) => (
            <li key={book.id}>
              <p>{book.book_name}</p>
              <small>By {book.author_name}</small>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
