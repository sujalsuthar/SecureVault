/**
 * Wipes app data and inserts sample vault data dated across the last ~3 months.
 * Run from server directory: npm run seed:demo
 * Requires MONGO_URI, JWT_SECRET, VAULT_ENCRYPTION_KEY in .env
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const VaultItem = require("../models/VaultItem");
const ActivityLog = require("../models/ActivityLog");
const { encryptVaultPassword } = require("../config/vaultCrypto");

const SEED_EMAIL = "marcus.chen@northlake.io";
const SEED_ACCOUNT_PASSWORD = "K7!mQx-v2Lnp";
const SEED_VAULT_PIN = "482193";

/** Fixed time-of-day so charts look natural (local server TZ). */
function daysAgoToDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + (daysAgo % 7), 10 + (daysAgo % 50), 0, 0);
  return d;
}

const SEED_VAULT_ROWS = [
  {
    title: "GitHub",
    username: "mchen-dev",
    password: "DemoPass-GitHub-2026-A1",
    notes: "Fine-grained token — expires Feb. Revoke if laptop stolen.",
    daysAgo: 2,
  },
  {
    title: "AWS Console",
    username: "marcus.chen@northlake.io",
    password: "xK9#mP2$vLqWnR5!",
    notes: "Root MFA on YubiKey. Budget alarm at $400.",
    daysAgo: 6,
  },
  {
    title: "Slack — Northlake",
    username: "marcus@northlake.io",
    password: "DemoPass-Slack-2026-A3",
    notes: "Workspace admin. Guest channels for vendors.",
    daysAgo: 11,
  },
  {
    title: "Stripe",
    username: "acct_1NQvK2Lk8mNpQr",
    password: "DemoPass-Stripe-2026-A4",
    notes: "Webhook secret in Railway env STRIPE_WHSEC",
    daysAgo: 14,
  },
  {
    title: "Vercel",
    username: "marcus@northlake.io",
    password: "DemoPass-Vercel-2026-A5",
    notes: "Team: product-web. Preview deploys OK.",
    daysAgo: 19,
  },
  {
    title: "MongoDB Atlas",
    username: "cluster0-admin",
    password: "AtlasSrv_k9Xm2Pq7!vNw",
    notes: "Network access: office + VPN IPs only.",
    daysAgo: 24,
  },
  {
    title: "1Password — family",
    username: "marcus.chen.personal@gmail.com",
    password: "OP-emergency-kit-folder-88",
    notes: "Paper recovery in safe. Spouse has viewer.",
    daysAgo: 28,
  },
  {
    title: "Okta — Northlake SSO",
    username: "admin@northlake.okta.com",
    password: "OktaSuper8!RotatedQ3",
    notes: "Break-glass admin. Use only from corp laptop.",
    daysAgo: 33,
  },
  {
    title: "Datadog",
    username: "ops@northlake.io",
    password: "DemoPass-Datadog-2026-A9",
    notes: "Monitors: API p95, error rate, RDS connections.",
    daysAgo: 38,
  },
  {
    title: "Cloudflare",
    username: "marcus@northlake.io",
    password: "DemoPass-Cloudflare-2026-A10",
    notes: "WAF managed rules + custom block on /wp-admin",
    daysAgo: 44,
  },
  {
    title: "Linear",
    username: "marcus@northlake.io",
    password: "DemoPass-Linear-2026-A11",
    notes: "Sprint cycles. Import from Jira done last year.",
    daysAgo: 49,
  },
  {
    title: "Figma",
    username: "marcus.chen@northlake.io",
    password: "DemoPass-Figma-2026-A12",
    notes: "Org design system file — edit access",
    daysAgo: 55,
  },
  {
    title: "SendGrid",
    username: "apikey_transactional",
    password: "DemoPass-SendGrid-2026-A13",
    notes: "Only transactional templates. Marketing uses Mailchimp.",
    daysAgo: 61,
  },
  {
    title: "Jira Cloud",
    username: "marcus.chen@northlake.io",
    password: "DemoPass-Jira-2026-A14",
    notes: "Project NL-ENG. Board filters saved.",
    daysAgo: 66,
  },
  {
    title: "PagerDuty",
    username: "oncall@northlake.io",
    password: "DemoPass-PagerDuty-2026-A15",
    notes: "Low-urgency → Slack #infra-oncall",
    daysAgo: 72,
  },
  {
    title: "Docker Hub",
    username: "northlakebuild",
    password: "DemoPass-DockerHub-2026-A16",
    notes: "CI push from GitHub Actions only.",
    daysAgo: 78,
  },
  {
    title: "Notion",
    username: "marcus@northlake.io",
    password: "DemoPass-Notion-2026-A17",
    notes: "Engineering wiki + onboarding checklist",
    daysAgo: 83,
  },
  {
    title: "Zoom",
    username: "marcus.chen@northlake.io",
    password: "Zm_sso_saml_2024_Northlake",
    notes: "Webinar add-on. Recording to Drive.",
    daysAgo: 88,
  },
  {
    title: "PayPal Business",
    username: "finance@northlake.io",
    password: "PP_Biz_!k9Xm2Q7vNwL4",
    notes: "Payouts Thu. 2FA app + SMS backup.",
    daysAgo: 91,
  },
];

const SEED_ACTIVITY = [
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 0 },
  { action: "VAULT_UNLOCKED", description: "Vault unlocked with master password", daysAgo: 0 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 3 },
  { action: "MASTER_PASSWORD_SET", description: "Vault master password was created", daysAgo: 91 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 14 },
  { action: "VAULT_ITEM_CREATED", description: 'Created vault item "Stripe"', daysAgo: 14 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 45 },
  { action: "VAULT_ITEM_CREATED", description: 'Created vault item "Cloudflare"', daysAgo: 44 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 75 },
];

async function clearUploadFiles() {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  try {
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        if (entry.isFile() && entry.name !== ".gitkeep") {
          await fs.unlink(path.join(uploadsDir, entry.name));
        }
      })
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function seed() {
  console.log("Connecting to MongoDB…");
  await connectDB();

  console.log("Removing existing users, vault items, and activity logs…");
  await VaultItem.deleteMany({});
  await ActivityLog.deleteMany({});
  await User.deleteMany({});

  await clearUploadFiles();
  console.log("Upload folder cleared (except .gitkeep).");

  const salt = await bcrypt.genSalt(10);
  const hashedAccountPassword = await bcrypt.hash(SEED_ACCOUNT_PASSWORD, salt);
  const hashedPin = await bcrypt.hash(SEED_VAULT_PIN, await bcrypt.genSalt(10));

  const user = await User.create({
    name: "Marcus Chen",
    email: SEED_EMAIL,
    password: hashedAccountPassword,
    masterPasswordHash: hashedPin,
    lastLogin: daysAgoToDate(0),
    createdAt: daysAgoToDate(92),
  });

  console.log("Creating vault items with historical dates (last ~3 months)…");

  for (const row of SEED_VAULT_ROWS) {
    const createdAt = daysAgoToDate(row.daysAgo);
    await VaultItem.create({
      title: row.title,
      username: row.username,
      password: encryptVaultPassword(row.password),
      notes: row.notes,
      fileUrl: "",
      userId: user._id,
      createdAt,
    });
  }

  for (const row of SEED_ACTIVITY) {
    await ActivityLog.create({
      userId: user._id,
      action: row.action,
      description: row.description,
      metadata: {},
      createdAt: daysAgoToDate(row.daysAgo),
    });
  }

  console.log("\n--- Sample data ready ---");
  console.log(`Login email:    ${SEED_EMAIL}`);
  console.log(`Login password: ${SEED_ACCOUNT_PASSWORD}`);
  console.log(`Vault PIN:      ${SEED_VAULT_PIN} (6 digits)`);
  console.log(`Vault items:    ${SEED_VAULT_ROWS.length} (dated across ~3 months)`);
  console.log("------------------------\n");

  await mongoose.connection.close();
  console.log("Done. Database connection closed.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
