import { useEffect, useMemo, useState } from "react";
import { uploadVaultFile } from "../api/uploadApi";
import { createVaultItem, deleteVaultItem, fetchVaultItems, updateVaultItem } from "../api/vaultApi";
import { downloadVaultBackupJson } from "../utils/downloadVaultBackup";
import AddVaultForm from "./AddVaultForm";
import VaultItem from "./VaultItem";

function getItemCreatedMs(item) {
  if (!item.createdAt) {
    return 0;
  }
  const ms = new Date(item.createdAt).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Search title, username, and notes; multiple words must all match (any field each). */
function itemMatchesSearch(item, rawQuery) {
  const terms = rawQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) {
    return true;
  }
  const haystack = [item.title, item.username, item.notes || ""]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function VaultManager({ heading = "Vault" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const loadVaultItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchVaultItems();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vault items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaultItems();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => itemMatchesSearch(item, searchTerm));
    const next = [...filtered];
    next.sort((a, b) => {
      const diff = getItemCreatedMs(a) - getItemCreatedMs(b);
      if (diff !== 0) {
        return sortOrder === "newest" ? -diff : diff;
      }
      return String(a._id).localeCompare(String(b._id));
    });
    return next;
  }, [items, searchTerm, sortOrder]);

  const handleAddItem = async (formData) => {
    setSaving(true);
    setError("");
    try {
      const { file, ...vaultPayload } = formData;
      let fileUrl = "";

      if (file) {
        const uploadResult = await uploadVaultFile(file);
        fileUrl = uploadResult.fileUrl || "";
      }

      const created = await createVaultItem({
        ...vaultPayload,
        fileUrl,
      });
      setItems((previous) => [created, ...previous]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add vault item");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    setError("");
    try {
      await deleteVaultItem(id);
      setItems((previous) => previous.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete vault item");
    }
  };

  const handleUpdateItem = async (id, payload) => {
    setError("");
    try {
      const updated = await updateVaultItem(id, payload);
      setItems((previous) => previous.map((item) => (item._id === id ? updated : item)));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update vault item");
      return false;
    }
  };

  const handleExportBackup = async () => {
    setExporting(true);
    setError("");
    try {
      const freshItems = await fetchVaultItems();
      downloadVaultBackupJson(freshItems);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export vault backup");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="panel space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="heading-lg">{heading}</h2>
          <p className="muted mt-1 text-sm sm:text-[0.9375rem]">
            Manage passwords, notes, and account metadata with encrypted API operations.
          </p>
          <button
            type="button"
            className="btn-secondary mt-3 w-full sm:w-auto"
            onClick={handleExportBackup}
            disabled={loading || exporting}
          >
            {exporting ? "Preparing backup…" : "Export JSON backup"}
          </button>
        </div>
        <div className="grid w-full max-w-md grid-cols-2 gap-2 text-right sm:ml-auto sm:w-auto sm:max-w-none sm:shrink-0">
          <div className="panel-subtle px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">Total Records</p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-cyan-100">{items.length}</p>
          </div>
          <div className="panel-subtle px-3 py-2">
            <p className="text-[0.65rem] uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">Matching</p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-cyan-100">{filteredAndSortedItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <AddVaultForm onSubmit={handleAddItem} isSubmitting={saving} />

        <div className="panel-subtle space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 w-full flex-1 sm:min-w-[12rem]">
              <label className="text-sm font-medium text-slate-800 dark:text-cyan-100" htmlFor="vault-search">
                Search & filter
              </label>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  id="vault-search"
                  className="input-cyber min-w-0 w-full flex-1"
                  type="search"
                  autoComplete="off"
                  placeholder="Title, username, notes — space = match all words"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-describedby="vault-search-hint"
                />
                {searchTerm ? (
                  <button type="button" className="btn-secondary w-full shrink-0 sm:w-auto" onClick={() => setSearchTerm("")}>
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[11rem]">
              <label className="text-sm font-medium text-slate-800 dark:text-cyan-100" htmlFor="vault-sort">
                Sort by date
              </label>
              <select
                id="vault-sort"
                className="input-cyber mt-1 w-full"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
          <p id="vault-search-hint" className="text-xs text-slate-500 dark:text-slate-400">
            Results update as you type. Each word must appear somewhere in the title, username, or notes.
          </p>
          {!loading && items.length > 0 ? (
            <p className="text-sm font-medium text-slate-800 dark:text-cyan-100">
              Showing{" "}
              <span className="tabular-nums">{filteredAndSortedItems.length}</span> of{" "}
              <span className="tabular-nums">{items.length}</span>{" "}
              {items.length === 1 ? "entry" : "entries"}
              {searchTerm.trim() ? ` for “${searchTerm.trim()}”` : ""}
            </p>
          ) : null}
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-cyan-300/20 dark:bg-cyber-800/70 dark:text-slate-200">
            Tip: combine words (e.g. <span className="font-mono text-xs">work email</span>) to narrow results; use sort to browse by when items were added.
          </div>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Loading vault assets...</p> : null}
      {!loading && items.length === 0 ? <p className="muted">No records found. Add your first credential above.</p> : null}
      {!loading && items.length > 0 && filteredAndSortedItems.length === 0 ? (
        <p className="muted">No matching records for this search query.</p>
      ) : null}

      <div className="grid gap-3">
        {filteredAndSortedItems.map((item) => (
          <VaultItem key={item._id} item={item} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} />
        ))}
      </div>
    </section>
  );
}

export default VaultManager;
