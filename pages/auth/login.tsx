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
      setError("Netinkamas el. pašto adresas arba slaptažodis. Bandykite dar kartą.");
    } else {
      router.push("/"); // Redirect to the home page after login
    }
  };

  return (
    <div className="login-container">
      <h1>Sveiki sugrįžę</h1>
      <p>Norėdami tęsti, prisijunkite prie savo paskyros</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label>El. paštas:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Įveskite savo el. pašto adresą"
          />
        </div>
        <div className="form-group">
          <label>Slaptažodis:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Įveskite savo slaptažodį"
          />
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "Prijungiama..." : "Prisijungti"}
        </button>
        <a><br /></a>
        <button onClick={() => signIn("github")} className="github-login-button">
          Prisijungti naudojantis GitHub
        </button>
      </form>

      <div className="extra-links">
        <p>
          Neturite paskyros?{" "}
          <a href="/auth/register" className="register-link">
            Registruokitės čia
          </a>
        </p>
        <p>
          <a href="/auth/forgot-password" className="forgot-password-link">
            Pamiršote slaptažodį?
          </a>
        </p>
      </div>
    </div>
  );
}
