import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // TODO: replace with a real call to services/authService.js
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    // Mocked login — swap for actual API response { user, role, token }
    const mockUser = {
      name: "Demo User",
      email: form.email,
      role: form.email.includes("admin") ? "admin" : "user",
    };

    login(mockUser);
    navigate(mockUser.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          style={{ display: "block", width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          style={{ display: "block", width: "100%" }}
        />
      </div>

      <button type="submit">Log In</button>

      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
