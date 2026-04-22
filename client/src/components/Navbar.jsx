import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMasterVault } from "../context/MasterVaultContext";
import { useTheme } from "../context/ThemeContext";

const getNavClass = ({ isActive }) =>
  isActive
    ? "rounded-lg border border-sky-300/70 bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-800 dark:border-cyan-300/50 dark:bg-cyan-400/10 dark:text-cyan-100"
    : "rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:text-slate-300 dark:hover:border-cyan-300/30 dark:hover:text-cyan-100";

function Navbar() {
  const { token, user, logout } = useAuth();
  const { isVaultUnlocked, lockVault } = useMasterVault();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg dark:border-cyan-300/20 dark:bg-cyber-900/75">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-300 bg-sky-100 text-[0.65rem] font-bold text-sky-700 sm:h-10 sm:w-10 sm:text-xs dark:border-cyan-300/40 dark:bg-cyan-400/15 dark:text-cyan-200">
            SV
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 sm:text-sm sm:tracking-[0.22em] dark:text-cyan-200/90">
              SecureVault
            </p>
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">Security Operations Console</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
          <button
            type="button"
            className="btn-secondary order-last w-full sm:order-none sm:w-auto"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            <span className="sm:hidden">{theme === "dark" ? "Light theme" : "Dark theme"}</span>
            <span className="hidden sm:inline">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <nav className="order-first flex flex-wrap items-center justify-center gap-1 sm:order-none sm:justify-end">
            {token ? (
              <>
                <NavLink className={getNavClass} to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className={getNavClass} to="/vault">
                  Vault
                </NavLink>
                {user?.hasMasterPassword && isVaultUnlocked ? (
                  <button type="button" className="btn-secondary" onClick={lockVault}>
                    Lock vault
                  </button>
                ) : null}
                <span className="hidden max-w-[10rem] truncate rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 md:inline-flex md:max-w-[14rem] md:px-3 dark:border-cyan-300/30 dark:bg-cyan-400/10 dark:text-cyan-100">
                  {user?.name || "Operator"}
                </span>
                <button type="button" className="btn-secondary sm:flex-none" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink className={getNavClass} to="/login">
                  Login
                </NavLink>
                <NavLink className={getNavClass} to="/register">
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
