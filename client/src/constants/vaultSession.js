export const VAULT_SESSION_KEY = "securevaultVaultSession";

export function getVaultSession() {
  return sessionStorage.getItem(VAULT_SESSION_KEY) || "";
}

export function setVaultSession(token) {
  if (token) {
    sessionStorage.setItem(VAULT_SESSION_KEY, token);
  } else {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
  }
}

export function clearVaultSession() {
  sessionStorage.removeItem(VAULT_SESSION_KEY);
}
