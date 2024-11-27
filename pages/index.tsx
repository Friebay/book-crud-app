import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <header>
        <h1>Welcome to the Book List App</h1>
      </header>

      <main className="main">
        <h2>Get Started</h2>
        <p>
          Please <Link href="/auth/register">Register</Link> or <Link href="/auth/login">Log In</Link> to manage your book lists.
        </p>
        <div className="buttons">
          <Link href="/auth/register">
            <button>Register</button>
          </Link>
          <Link href="/auth/login">
            <button>Log In</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
