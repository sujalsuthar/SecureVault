import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearVaultSession, getVaultSession, setVaultSession } from "../constants/vaultSession";

const MasterVaultContext = createContext(null);

export function MasterVaultProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => Boolean(getVaultSession()));

  useEffect(() => {
    const sync = () => setUnlocked(Boolean(getVaultSession()));
    window.addEventListener("vault-session-expired", sync);
    return () => window.removeEventListener("vault-session-expired", sync);
  }, []);

  const lockVault = () => {
    clearVaultSession();
    setUnlocked(false);
  };

  const acknowledgeUnlock = (vaultToken) => {
    setVaultSession(vaultToken);
    setUnlocked(true);
  };

  const value = useMemo(
    () => ({
      isVaultUnlocked: unlocked,
      lockVault,
      acknowledgeUnlock,
    }),
    [unlocked]
  );

  return <MasterVaultContext.Provider value={value}>{children}</MasterVaultContext.Provider>;
}

export function useMasterVault() {
  const context = useContext(MasterVaultContext);
  if (!context) {
    throw new Error("useMasterVault must be used within MasterVaultProvider");
  }
  return context;
}
