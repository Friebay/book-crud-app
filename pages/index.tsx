import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const [randomBooks, setRandomBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const { data: session } = useSession(); // Get session data

  // Fetch data from "books.sqlite"
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

  return (
    <div className="container">
      <header>
        <h1>Welcome to the Book List App</h1>
      </header>

      <aside className="sidebar">
        <h2>Get Started</h2>
        {!session ? (
          <>
            <p>
              <Link href="/auth/register">
                <button>Register</button>
              </Link>
            </p>
            <p>
              <Link href="/auth/login">
                <button>Log In</button>
              </Link>
            </p>
          </>
        ) : (
          <p>
            <button onClick={() => signOut()}>Log Out</button>
          </p>
        )}
        <p>
          <Link href="/search">
            <button>Search</button>
          </Link>
        </p>
      </aside>

      <main className="main">
        <h2>Recommended Books</h2>
        <div className="book-cards">
          {randomBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <h3>{book.book_name}</h3>
              <p>By {book.author_name}</p>
              <a href={book.hyperlink} target="_blank" rel="noopener noreferrer">
                Buy for ${book.price}
              </a>
            </div>
          ))}
        </div>
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
