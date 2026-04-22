import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordBreachWarning from "../components/PasswordBreachWarning";
import { useAuth } from "../context/AuthContext";
import { usePwnedPasswordCheck } from "../hooks/usePwnedPasswordCheck";

function Register() {
  const navigate = useNavigate();
  const { register, authLoading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const breachCheck = usePwnedPasswordCheck(form.password, true);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await register(form);
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="panel hidden space-y-3 lg:block">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-cyan-300">Onboarding</p>
        <h1 className="heading-lg">Build Your Secure Workspace</h1>
        <p className="muted">
          Create an operator account and start managing high-value credentials in a hardened, responsive interface.
        </p>
        <div className="grid gap-2 text-sm">
          <p className="status-pill w-full justify-center">Encrypted Credential Storage</p>
          <p className="status-pill w-full justify-center">Protected Upload Endpoint</p>
          <p className="status-pill w-full justify-center">User-Scoped Vault Access</p>
        </div>
      </div>

      <div className="panel mx-auto w-full max-w-lg space-y-4 lg:mx-0 lg:max-w-none">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-cyan-300">New Operator</p>
          <h2 className="heading-lg mt-1">Create SecureVault Account</h2>
          <p className="muted mt-1">Initialize your secure dashboard and credential environment.</p>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="input-cyber" name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input className="input-cyber" type="email" name="email" placeholder="Email address" value={form.email} onChange={handleChange} required />
          <input
            className="input-cyber"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <PasswordBreachWarning
            loading={breachCheck.loading}
            pwned={breachCheck.pwned}
            count={breachCheck.count}
            error={breachCheck.error}
          />
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={authLoading}>
            {authLoading ? "Provisioning..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already have access?{" "}
          <Link className="link-cyber font-medium" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
