import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data.books);
    } else {
      setResults([]);
    }

    setIsLoading(false);
  };

  return (
    <div className="search-container">
      <header className="search-header">
        <h1>Search Books</h1>
        <div className="header-buttons">
          <button onClick={() => (window.location.href = "/")}>Home</button>
          <button onClick={() => (window.location.href = "/books")}>Books</button>
          <button onClick={() => signOut()}>Log Out</button>
        </div>
      </header>

      <main className="search-main">
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

        <div className="results">
          {isLoading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            <div className="results-grid">
              {results.map((book) => (
                <div key={book.id} className="book-card">
                  <h3>{book.book_name}</h3>
                  <p>By {book.author_name}</p>
                  <a
                    href={book.hyperlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-link"
                  >
                    Buy for ${book.price}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No results found</p>
          )}
        </div>
      </main>
    </div>
  );
}
