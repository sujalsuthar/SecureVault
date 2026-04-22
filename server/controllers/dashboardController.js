const fs = require("fs");
const path = require("path");
const ActivityLog = require("../models/ActivityLog");
const VaultItem = require("../models/VaultItem");
const { isVaultUnlockedRequest } = require("../middleware/vaultMiddleware");

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS_IN_CHART = 12;

/** Start of Monday 00:00:00 UTC for the calendar week containing `date`. */
function getMondayUtcStart(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function getVaultItemsPerWeek(userId) {
  const thisMonday = getMondayUtcStart();
  const weekRanges = [];

  for (let w = 0; w < WEEKS_IN_CHART; w += 1) {
    const weekStart = new Date(thisMonday.getTime() - (WEEKS_IN_CHART - 1 - w) * WEEK_MS);
    const weekEnd = new Date(weekStart.getTime() + WEEK_MS);
    weekRanges.push({ weekStart, weekEnd });
  }

  const counts = await Promise.all(
    weekRanges.map(({ weekStart, weekEnd }) =>
      VaultItem.countDocuments({
        userId,
        createdAt: { $gte: weekStart, $lt: weekEnd },
      })
    )
  );

  return weekRanges.map((range, index) => ({
    weekStart: range.weekStart.toISOString(),
    label: range.weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    count: counts[index],
  }));
}

const getDashboardStats = async (req, res, next) => {
  try {
    if (!isVaultUnlockedRequest(req)) {
      return res.status(200).json({
        totalVaultItems: 0,
        recentlyAddedItems: 0,
        totalUploadedFiles: 0,
        activityHistory: [],
        vaultItemsPerWeek: [],
        vaultLocked: true,
      });
    }

    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalVaultItems, recentlyAddedItems, recentActivities, vaultItemsPerWeek] = await Promise.all([
      VaultItem.countDocuments({ userId }),
      VaultItem.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      getVaultItemsPerWeek(userId),
    ]);

    const uploadsPath = path.join(__dirname, "..", "uploads");
    let totalUploadedFiles = 0;

    try {
      const files = await fs.promises.readdir(uploadsPath, { withFileTypes: true });
      const userPrefix = `${String(userId)}-`;
      const userScopedFiles = files.filter((entry) => entry.isFile() && entry.name.startsWith(userPrefix));

      // Backward compatibility: older uploads may not include user-prefixed filenames.
      if (userScopedFiles.length > 0) {
        totalUploadedFiles = userScopedFiles.length;
      } else {
        totalUploadedFiles = files.filter((entry) => entry.isFile() && entry.name !== ".gitkeep").length;
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    return res.status(200).json({
      totalVaultItems,
      recentlyAddedItems,
      totalUploadedFiles,
      vaultLocked: false,
      vaultItemsPerWeek,
      activityHistory: recentActivities.map((activity) => ({
        id: activity._id,
        action: activity.action,
        description: activity.description,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
};
