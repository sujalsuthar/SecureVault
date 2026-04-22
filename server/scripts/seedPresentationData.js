require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const VaultItem = require("../models/VaultItem");
const ActivityLog = require("../models/ActivityLog");
const { encryptVaultPassword } = require("../config/vaultCrypto");

const ACCOUNT = {
  name: "Sujal Suthar",
  email: "sujalsuthar2005@gmail.com",
  password: "password123",
  masterPin: "927461",
};

function daysAgoToDate(daysAgo, hour = 10, minute = 15) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const vaultRows = [
  {
    title: "GitHub",
    username: "sujalsuthar",
    password: "Gh!2026-SecureVault",
    notes: "Personal repositories and CI tokens.",
    daysAgo: 2,
  },
  {
    title: "LinkedIn",
    username: "sujalsuthar2005@gmail.com",
    password: "Li#Career-Update26",
    notes: "Profile updated with latest projects.",
    daysAgo: 4,
  },
  {
    title: "Google Workspace",
    username: "sujalsuthar2005@gmail.com",
    password: "Gsuite!MailDrive26",
    notes: "Mail, Drive, and calendar sync active.",
    daysAgo: 6,
  },
  {
    title: "Vercel",
    username: "sujalsuthar2005@gmail.com",
    password: "Vrcl@Deploy-26",
    notes: "Production project connected to GitHub.",
    daysAgo: 8,
  },
  {
    title: "Render",
    username: "sujalsuthar2005@gmail.com",
    password: "Rndr!BackendLive26",
    notes: "Backend service with autosleep enabled.",
    daysAgo: 10,
  },
  {
    title: "MongoDB Atlas",
    username: "cypher",
    password: "Mdb@ClusterAccess26",
    notes: "Cluster monitored weekly for usage spikes.",
    daysAgo: 12,
  },
  {
    title: "Notion",
    username: "sujalsuthar2005@gmail.com",
    password: "Ntn!ProjectTracker26",
    notes: "Roadmap and task board for app updates.",
    daysAgo: 14,
  },
  {
    title: "Figma",
    username: "sujalsuthar2005@gmail.com",
    password: "Fgm@DesignSystem26",
    notes: "UI library and handoff boards.",
    daysAgo: 16,
  },
  {
    title: "Paytm Business",
    username: "sujalsuthar2005@gmail.com",
    password: "Pytm#Merchant26",
    notes: "Monthly settlement checks and invoices.",
    daysAgo: 18,
  },
  {
    title: "Razorpay",
    username: "sujalsuthar2005@gmail.com",
    password: "Rzr@Payments26",
    notes: "Webhook key rotated this month.",
    daysAgo: 21,
  },
  {
    title: "Netlify",
    username: "sujalsuthar2005@gmail.com",
    password: "Ntlfy!Static26",
    notes: "Legacy frontend backups stored.",
    daysAgo: 24,
  },
  {
    title: "Zoom",
    username: "sujalsuthar2005@gmail.com",
    password: "Zm@Meetings26",
    notes: "Weekly review meetings with teammates.",
    daysAgo: 27,
  },
];

const activityRows = [
  { action: "MASTER_PASSWORD_SET", description: "Vault master password was created", daysAgo: 30 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 29 },
  { action: "VAULT_UNLOCKED", description: "Vault unlocked with master password", daysAgo: 29 },
  { action: "VAULT_ITEM_CREATED", description: 'Created vault item "GitHub"', daysAgo: 27 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 24 },
  { action: "VAULT_ITEM_CREATED", description: 'Created vault item "MongoDB Atlas"', daysAgo: 21 },
  { action: "VAULT_ITEM_UPDATED", description: 'Updated vault item "Vercel"', daysAgo: 16 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 12 },
  { action: "VAULT_ITEM_CREATED", description: 'Created vault item "Razorpay"', daysAgo: 10 },
  { action: "VAULT_ITEM_DELETED", description: 'Deleted vault item "Old FTP"', daysAgo: 8 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 4 },
  { action: "VAULT_UNLOCKED", description: "Vault unlocked with master password", daysAgo: 4 },
  { action: "USER_LOGIN", description: "User logged in", daysAgo: 1 },
];

async function seedPresentationData() {
  console.log("Connecting to MongoDB...");
  await connectDB();

  const existingUser = await User.findOne({ email: ACCOUNT.email.toLowerCase() });
  if (existingUser) {
    await VaultItem.deleteMany({ userId: existingUser._id });
    await ActivityLog.deleteMany({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }

  const passwordHash = await bcrypt.hash(ACCOUNT.password, await bcrypt.genSalt(10));
  const masterPinHash = await bcrypt.hash(ACCOUNT.masterPin, await bcrypt.genSalt(10));

  const user = await User.create({
    name: ACCOUNT.name,
    email: ACCOUNT.email,
    password: passwordHash,
    masterPasswordHash: masterPinHash,
    createdAt: daysAgoToDate(30, 9, 20),
    lastLogin: daysAgoToDate(1, 20, 35),
  });

  for (const row of vaultRows) {
    await VaultItem.create({
      title: row.title,
      username: row.username,
      password: encryptVaultPassword(row.password),
      notes: row.notes,
      fileUrl: "",
      userId: user._id,
      createdAt: daysAgoToDate(row.daysAgo, 11 + (row.daysAgo % 4), 8 + (row.daysAgo % 35)),
    });
  }

  for (const row of activityRows) {
    await ActivityLog.create({
      userId: user._id,
      action: row.action,
      description: row.description,
      metadata: {},
      createdAt: daysAgoToDate(row.daysAgo, 13 + (row.daysAgo % 5), 12 + (row.daysAgo % 40)),
    });
  }

  console.log("\nPresentation account is ready.");
  console.log(`Email: ${ACCOUNT.email}`);
  console.log(`Password: ${ACCOUNT.password}`);
  console.log(`Master PIN: ${ACCOUNT.masterPin}`);
  console.log(`Vault items inserted: ${vaultRows.length}`);
  console.log(`Activity entries inserted: ${activityRows.length}\n`);

  await mongoose.connection.close();
  process.exit(0);
}

seedPresentationData().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.connection.close();
  } catch {
    // Ignore close errors when connection was never opened.
  }
  process.exit(1);
});
