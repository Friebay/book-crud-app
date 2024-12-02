import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(""); // Clear previous errors

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false); // Stop loading

    if (res.ok) {
      setSuccess(true);
      setEmail("");
      setPassword("");

      // Redirect to login after a short delay
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      const data = await res.json();
      setError(data.message || "Failed to register. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h1>Create Your Account</h1>
      <p>Sign up to access your book lists and more.</p>

      {success && (
        <div className="success-message">
          Registration successful! Redirecting to log in...
        </div>
      )}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleRegister} className="register-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Create a strong password"
          />
        </div>
        <button type="submit" className="register-button" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <div className="extra-links">
        <p>
          Already have an account?{" "}
          <a href="/auth/login" className="login-link">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
