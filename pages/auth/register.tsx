import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });

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

  

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
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
          onChange={(e) => {
            const newPassword = e.target.value;
            setPassword(newPassword);
            checkPasswordStrength(newPassword);
          }}
          required
          placeholder="Create a strong password"
          className="password-input"
        />
        <div className="password-requirements">
          <p 
            style={{ 
              color: passwordStrength.length ? 'green' : 'red',
              fontWeight: 'bold'
            }}
          >
            {passwordStrength.length ? '✓' : '✗'} At least 12 characters
          </p>
          <p 
            style={{ 
              color: passwordStrength.uppercase ? 'green' : 'red',
              fontWeight: 'bold'
            }}
          >
            {passwordStrength.uppercase ? '✓' : '✗'} Contains uppercase letter
          </p>
          <p 
            style={{ 
              color: passwordStrength.lowercase ? 'green' : 'red',
              fontWeight: 'bold'
            }}
          >
            {passwordStrength.lowercase ? '✓' : '✗'} Contains lowercase letter
          </p>
          <p 
            style={{ 
              color: passwordStrength.number ? 'green' : 'red',
              fontWeight: 'bold'
            }}
          >
            {passwordStrength.number ? '✓' : '✗'} Contains number
          </p>
          <p 
            style={{ 
              color: passwordStrength.specialChar ? 'green' : 'red',
              fontWeight: 'bold'
            }}
          >
            {passwordStrength.specialChar ? '✓' : '✗'} Contains special character
          </p>
        </div>
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
