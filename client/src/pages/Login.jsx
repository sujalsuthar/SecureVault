import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordBreachWarning from "../components/PasswordBreachWarning";
import { useAuth } from "../context/AuthContext";
import { usePwnedPasswordCheck } from "../hooks/usePwnedPasswordCheck";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const breachCheck = usePwnedPasswordCheck(form.password, true);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      const redirectPath = location.state?.from || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="panel hidden space-y-3 lg:block">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-cyan-300">Security Stack</p>
        <h1 className="heading-lg">Professional Credential Security</h1>
        <p className="muted">
          SecureVault helps teams store passwords and account data in one protected dashboard with authenticated API access.
        </p>
        <div className="grid gap-2 text-sm">
          <p className="status-pill w-full justify-center">JWT Session Controls</p>
          <p className="status-pill w-full justify-center">Protected Vault Routes</p>
          <p className="status-pill w-full justify-center">MongoDB Secure Sync</p>
        </div>
      </div>

      <div className="panel mx-auto w-full max-w-lg space-y-4 lg:mx-0 lg:max-w-none">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-cyan-300">Operator Access</p>
          <h2 className="heading-lg mt-1">Sign In to SecureVault</h2>
          <p className="muted mt-1">Authenticate to access your credential command center.</p>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          {location.state?.sessionTimeout ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              Your session ended after 10 minutes of inactivity. Please sign in again.
            </p>
          ) : null}
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
          <button className="btn-primary w-full" type="submit" disabled={authLoading}>
            {authLoading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="muted">
          New operator?{" "}
          <Link className="link-cyber font-medium" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
