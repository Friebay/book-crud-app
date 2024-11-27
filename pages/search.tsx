import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data.books);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Search Books</h1>
      </header>

      <main>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by author or book name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit">Search</button>
        </form>

        <div className="results">
          {results.length > 0 ? (
            results.map((book) => (
              <div key={book.id} className="book-card">
                <h3>{book.book_name}</h3>
                <p>By {book.author_name}</p>
                <a href={book.hyperlink} target="_blank" rel="noopener noreferrer">
                  Buy for ${book.price}
                </a>
              </div>
            ))
          ) : (
            <p>No results found</p>
          )}
        </div>
      </main>

      <style jsx>{`
        .container {
          padding: 20px;
        }

        header {
          text-align: center;
          margin-bottom: 20px;
        }

        form {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        input {
          width: 300px;
          padding: 10px;
          margin-right: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #005bb5;
        }

        .results {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .book-card {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
          background-color: #fafafa;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .book-card h3 {
          margin: 0 0 10px;
        }

        .book-card a {
          color: #0070f3;
          text-decoration: none;
        }

        .book-card a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
