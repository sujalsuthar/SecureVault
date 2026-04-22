import { useState } from "react";
import { setupMasterPassword, verifyMasterPassword } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useMasterVault } from "../context/MasterVaultContext";

const PIN_REGEX = /^\d{6}$/;

function VaultGate({ children }) {
  const { user, authLoading, refreshUser } = useAuth();
  const { isVaultUnlocked, acknowledgeUnlock } = useMasterVault();
  const [setupPin, setSetupPin] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [unlockPin, setUnlockPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (authLoading || !user) {
    return (
      <section className="panel">
        <p className="muted">Loading account…</p>
      </section>
    );
  }

  if (user.hasMasterPassword !== true && user.hasMasterPassword !== false) {
    return (
      <section className="panel">
        <p className="muted">Syncing security settings…</p>
      </section>
    );
  }

  const handleSetup = async (event) => {
    event.preventDefault();
    setError("");
    if (!PIN_REGEX.test(setupPin) || !PIN_REGEX.test(setupConfirm)) {
      setError("Enter exactly 6 digits for both fields.");
      return;
    }
    if (setupPin !== setupConfirm) {
      setError("PINs do not match.");
      return;
    }
    setBusy(true);
    try {
      await setupMasterPassword({ masterPassword: setupPin });
      await refreshUser();
      const { vaultToken } = await verifyMasterPassword({ masterPassword: setupPin });
      acknowledgeUnlock(vaultToken);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save master password.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async (event) => {
    event.preventDefault();
    setError("");
    if (!PIN_REGEX.test(unlockPin)) {
      setError("Enter your 6-digit vault PIN.");
      return;
    }
    setBusy(true);
    try {
      const { vaultToken } = await verifyMasterPassword({ masterPassword: unlockPin });
      acknowledgeUnlock(vaultToken);
      setUnlockPin("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not unlock vault.");
    } finally {
      setBusy(false);
    }
  };

  if (user.hasMasterPassword === false) {
    return (
      <section className="panel mx-auto w-full max-w-lg space-y-4">
        <h2 className="heading-lg">Create vault PIN</h2>
        <p className="muted">
          Choose a 6-digit PIN to protect your vault. After each login you will enter it before viewing or editing credentials.
        </p>
        <form onSubmit={handleSetup} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-800 dark:text-cyan-100" htmlFor="vault-pin-setup">
              6-digit PIN
            </label>
            <input
              id="vault-pin-setup"
              className="input-cyber mt-1"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              placeholder="••••••"
              value={setupPin}
              onChange={(event) => setSetupPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800 dark:text-cyan-100" htmlFor="vault-pin-confirm">
              Confirm PIN
            </label>
            <input
              id="vault-pin-confirm"
              className="input-cyber mt-1"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={6}
              placeholder="••••••"
              value={setupConfirm}
              onChange={(event) => setSetupConfirm(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save PIN and continue"}
          </button>
        </form>
      </section>
    );
  }

  if (!isVaultUnlocked) {
    return (
      <section className="panel mx-auto w-full max-w-lg space-y-4">
        <h2 className="heading-lg">Unlock vault</h2>
        <p className="muted">Enter your 6-digit master PIN to access stored credentials.</p>
        <form onSubmit={handleUnlock} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-800 dark:text-cyan-100" htmlFor="vault-pin-unlock">
              Master PIN
            </label>
            <input
              id="vault-pin-unlock"
              className="input-cyber mt-1"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              placeholder="••••••"
              value={unlockPin}
              onChange={(event) => setUnlockPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={busy}>
            {busy ? "Unlocking…" : "Unlock vault"}
          </button>
        </form>
      </section>
    );
  }

  return children;
}

export default VaultGate;
