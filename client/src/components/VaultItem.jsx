import { useEffect, useState } from "react";
import { usePwnedPasswordCheck } from "../hooks/usePwnedPasswordCheck";
import PasswordBreachWarning from "./PasswordBreachWarning";

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = value;
  tempTextArea.style.position = "fixed";
  tempTextArea.style.left = "-9999px";
  document.body.appendChild(tempTextArea);
  tempTextArea.focus();
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

function VaultItem({ item, onDelete, onUpdate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editError, setEditError] = useState("");
  const [form, setForm] = useState({
    title: item.title,
    username: item.username,
    password: item.password,
    notes: item.notes || "",
  });

  const breachCheck = usePwnedPasswordCheck(form.password, isEditing);

  useEffect(() => {
    setForm({
      title: item.title,
      username: item.username,
      password: item.password,
      notes: item.notes || "",
    });
  }, [item]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCopyPassword = async () => {
    try {
      await copyText(item.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      setCopied(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.username.trim() || !form.password.trim()) {
      setEditError("Title, username, and password are required");
      return;
    }

    setEditError("");
    setIsSaving(true);
    const ok = await onUpdate(item._id, {
      title: form.title.trim(),
      username: form.username.trim(),
      password: form.password,
      notes: form.notes.trim(),
    });

    if (ok) {
      setIsEditing(false);
    } else {
      setEditError("Failed to update item");
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setForm({
      title: item.title,
      username: item.username,
      password: item.password,
      notes: item.notes || "",
    });
    setEditError("");
    setIsEditing(false);
  };

  return (
    <article className="panel-subtle space-y-3">
      {isEditing ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Title</span>
              <input className="input-cyber" name="title" value={form.title} onChange={handleChange} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">Username</span>
              <input className="input-cyber" name="username" value={form.username} onChange={handleChange} />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Password</span>
            <input
              className="input-cyber"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
            />
            <PasswordBreachWarning
              loading={breachCheck.loading}
              pwned={breachCheck.pwned}
              count={breachCheck.count}
              error={breachCheck.error}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">Notes</span>
            <textarea className="textarea-cyber" name="notes" value={form.notes} onChange={handleChange} />
          </label>
          {editError ? <p className="error-text">{editError}</p> : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
            <button className="btn-primary w-full sm:w-auto" type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn-secondary w-full sm:w-auto" type="button" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-semibold text-slate-900 dark:text-cyan-100">{item.title}</h3>
              <p className="muted mt-1 text-xs sm:text-sm">Created: {new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <span className="status-pill w-fit shrink-0 self-start">Protected Record</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-cyan-300/20 dark:bg-cyber-800/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Username</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-white">{item.username}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-cyan-300/20 dark:bg-cyber-800/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Password</p>
              <p className="mt-1 break-all font-mono text-sm font-medium text-slate-900 dark:text-white">
                {showPassword ? item.password : "************"}
              </p>
            </div>
          </div>

          {item.notes ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-cyan-300/20 dark:bg-cyber-800/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{item.notes}</p>
            </div>
          ) : null}

          {item.fileUrl ? (
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-cyan-300/20 dark:bg-cyber-800/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Uploaded File</p>
              <a
                className="mt-1 inline-block break-all text-sm font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-600 dark:text-cyan-200 dark:decoration-cyan-300/50 dark:hover:text-cyan-100"
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Attachment
              </a>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
            <button className="btn-secondary w-full sm:w-auto" type="button" onClick={handleCopyPassword}>
              {copied ? "Copied" : "Copy Password"}
            </button>
            <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button className="btn-danger w-full sm:w-auto" type="button" onClick={() => onDelete(item._id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default VaultItem;
