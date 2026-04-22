function PasswordBreachWarning({ loading, pwned, count, error }) {
  if (error) {
    return <p className="text-xs text-amber-800 dark:text-amber-200/90">{error}</p>;
  }

  if (loading && pwned === null) {
    return <p className="text-xs text-slate-500 dark:text-slate-400">Checking password against known data breaches…</p>;
  }

  if (pwned === true) {
    const formatted =
      typeof count === "number" && count > 0
        ? `This password has appeared in known data breaches (${count.toLocaleString()} times). Use a unique password.`
        : "This password has appeared in known data breaches. Use a unique password.";

    return (
      <div
        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
        role="status"
      >
        <p className="font-medium">Breach warning</p>
        <p className="mt-1 text-xs leading-relaxed opacity-95">{formatted}</p>
        <p className="mt-2 text-[0.65rem] text-amber-900/80 dark:text-amber-200/70">
          Checks use the Have I Been Pwned Pwned Passwords service (k-anonymity; your password is not sent).
        </p>
      </div>
    );
  }

  return null;
}

export default PasswordBreachWarning;
