import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboardStats } from "../api/dashboardApi";
import VaultItemsWeeklyChart from "../components/VaultItemsWeeklyChart";
import { useAuth } from "../context/AuthContext";
import { useMasterVault } from "../context/MasterVaultContext";

const initialStats = {
  totalVaultItems: 0,
  recentlyAddedItems: 0,
  totalUploadedFiles: 0,
  activityHistory: [],
  vaultItemsPerWeek: [],
  vaultLocked: true,
};

function Dashboard() {
  const { user } = useAuth();
  const { isVaultUnlocked } = useMasterVault();
  const [stats, setStats] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const data = await fetchDashboardStats();
        setStats({
          totalVaultItems: data.totalVaultItems || 0,
          recentlyAddedItems: data.recentlyAddedItems || 0,
          totalUploadedFiles: data.totalUploadedFiles || 0,
          activityHistory: Array.isArray(data.activityHistory) ? data.activityHistory : [],
          vaultItemsPerWeek: Array.isArray(data.vaultItemsPerWeek) ? data.vaultItemsPerWeek : [],
          vaultLocked: data.vaultLocked !== false,
        });
      } catch (error) {
        setStatsError(error.response?.data?.message || "Failed to load dashboard statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [isVaultUnlocked]);

  const vaultStatsHidden = stats.vaultLocked;
  const statCards = [
    { label: "Total Vault Items", value: stats.totalVaultItems, tone: "text-sky-700 dark:text-cyan-100" },
    { label: "Recently Added Items", value: stats.recentlyAddedItems, tone: "text-emerald-700 dark:text-emerald-200" },
    { label: "Total Uploaded Files", value: stats.totalUploadedFiles, tone: "text-violet-700 dark:text-violet-200" },
  ];

  return (
    <div className="grid gap-3 sm:gap-4">
      <section className="panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-700 dark:text-cyan-300">Security Control Center</p>
            <h1 className="heading-lg mt-1">Operations Dashboard</h1>
            <p className="muted mt-2 text-sm leading-relaxed sm:text-[0.9375rem]">
              Welcome, <span className="font-semibold text-slate-900 dark:text-cyan-100">{user?.name || "Operator"}</span>. Monitor account posture and manage protected vault assets.
            </p>
          </div>
          <span className="status-pill shrink-0 self-start">All Systems Operational</span>
        </div>

        {statsError ? <p className="error-text mt-4">{statsError}</p> : null}

        {vaultStatsHidden && !statsLoading ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-snug text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 sm:px-4">
            Vault metrics and activity are hidden until you unlock the vault with your 6-digit PIN.{" "}
            <Link className="font-semibold underline underline-offset-2" to="/vault">
              Open Vault
            </Link>{" "}
            to unlock.
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:gap-3 lg:flex-row lg:items-stretch lg:gap-4">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {statCards.map((card) => (
              <div key={card.label} className="panel-subtle min-w-0">
                <p className="text-[0.65rem] uppercase leading-tight tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">{card.label}</p>
                <p className={`mt-1.5 text-2xl font-bold tabular-nums sm:mt-2 sm:text-3xl ${card.tone}`}>
                  {statsLoading ? "—" : vaultStatsHidden ? "—" : card.value}
                </p>
              </div>
            ))}
          </div>
          <div className="panel-subtle w-full min-w-0 shrink-0 lg:max-w-sm xl:max-w-md">
            <p className="text-[0.65rem] uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">Operator Email</p>
            <p className="mt-1.5 break-words text-xs font-semibold leading-snug text-slate-900 sm:text-sm dark:text-cyan-100">{user?.email || "-"}</p>
            <p className="mt-3 text-[0.65rem] uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">Last login</p>
            <p className="mt-1 break-words text-xs font-semibold leading-snug text-slate-900 sm:text-sm dark:text-cyan-100">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="panel-subtle overflow-hidden">
        <div className="min-w-0">
          <h2 className="heading-md">Vault analytics</h2>
          <p className="muted mt-1 text-sm">Items created per calendar week (UTC), last 12 weeks.</p>
        </div>
        {statsLoading ? <p className="muted mt-4">Loading chart…</p> : null}
        {!statsLoading && vaultStatsHidden ? (
          <p className="muted mt-4 text-sm">Unlock the vault to see weekly creation trends.</p>
        ) : null}
        {!statsLoading && !vaultStatsHidden && stats.vaultItemsPerWeek.length > 0 ? (
          <div className="mt-4 w-full min-w-0 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
            <div className="min-w-[min(100%,520px)] sm:min-w-0">
              <VaultItemsWeeklyChart data={stats.vaultItemsPerWeek} />
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 sm:gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel-subtle">
          <h2 className="heading-md">Security Briefing</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
            <li className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-cyan-300/20 dark:bg-cyber-800/70">
              Rotate critical credentials frequently and remove stale records.
            </li>
            <li className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-cyan-300/20 dark:bg-cyber-800/70">
              Keep vault notes updated with MFA details and recovery instructions.
            </li>
            <li className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-cyan-300/20 dark:bg-cyber-800/70">
              Track uploaded files to avoid unmanaged documents in secure workflows.
            </li>
          </ul>
        </div>

        <div className="panel-subtle">
          <h2 className="heading-md">Defense Checklist</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="status-pill w-full justify-center">Encryption in Transit</p>
            <p className="status-pill w-full justify-center">Protected API Routes</p>
            <p className="status-pill w-full justify-center">Role: Authenticated User</p>
          </div>
        </div>
      </section>

      <section className="panel-subtle">
        <h2 className="heading-md">Recent Activity</h2>
        {statsLoading ? <p className="muted mt-3">Loading activity history...</p> : null}
        {!statsLoading && vaultStatsHidden ? <p className="muted mt-3">Activity is available after you unlock the vault.</p> : null}
        {!statsLoading && !vaultStatsHidden && stats.activityHistory.length === 0 ? (
          <p className="muted mt-3">No recent activity yet.</p>
        ) : null}
        {!statsLoading && !vaultStatsHidden && stats.activityHistory.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {stats.activityHistory.map((activity) => (
              <li
                key={activity.id}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-cyan-300/20 dark:bg-cyber-800/70"
              >
                <p className="break-words font-medium text-slate-900 dark:text-cyan-100">{activity.description}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(activity.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

export default Dashboard;
