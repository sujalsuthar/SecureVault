const BACKUP_FORMAT = "securevault-backup";
const BACKUP_VERSION = 1;

/**
 * Triggers a download of the given vault items as a JSON backup file.
 * Includes plaintext passwords — treat the file as sensitive.
 */
export function downloadVaultBackupJson(items) {
  const exportedAt = new Date().toISOString();
  const payload = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt,
    itemCount: items.length,
    items: items.map((item) => ({
      _id: item._id,
      title: item.title,
      username: item.username,
      password: item.password,
      notes: item.notes ?? "",
      fileUrl: item.fileUrl ?? "",
      createdAt: item.createdAt,
    })),
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `securevault-backup-${exportedAt.slice(0, 10)}.json`;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}
