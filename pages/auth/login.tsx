import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(""); // Clear any previous errors

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false); // Stop loading

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/"); // Redirect to the home page after login
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome Back</h1>
      <p>Log in to your account to continue</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin} className="login-form">
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
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Logging In..." : "Log In"}
        </button>
        <a><br /></a>
        <button onClick={() => signIn("github")} className="github-login-button">
          Log in with GitHub
        </button>
      </form>

      <div className="extra-links">
        <p>
          Don't have an account?{" "}
          <a href="/auth/register" className="register-link">
            Register here
          </a>
        </p>
        <p>
          <a href="/auth/forgot-password" className="forgot-password-link">
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  );
}
