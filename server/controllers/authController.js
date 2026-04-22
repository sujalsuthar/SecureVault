const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../config/generateToken");
const generateVaultToken = require("../config/generateVaultToken");
const { createActivityLog } = require("../config/activityLogger");

const MASTER_PIN_REGEX = /^\d{6}$/;

const validateEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      return next(new Error("Name, email, and password are required"));
    }

    if (!validateEmail(email)) {
      res.status(400);
      return next(new Error("Please provide a valid email address"));
    }

    if (password.length < 6) {
      res.status(400);
      return next(new Error("Password must be at least 6 characters long"));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409);
      return next(new Error("User with this email already exists"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error("Email and password are required"));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }

    const lastLogin = new Date();
    await User.findByIdAndUpdate(user._id, { lastLogin });

    const token = generateToken(user._id);
    const userWithPin = await User.findById(user._id).select("+masterPasswordHash");
    const hasMasterPassword = Boolean(userWithPin?.masterPasswordHash);

    await createActivityLog({
      userId: user._id,
      action: "USER_LOGIN",
      description: "User logged in",
      metadata: {
        email: user.email,
      },
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin,
        hasMasterPassword,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+masterPasswordHash");
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || null,
        hasMasterPassword: Boolean(user.masterPasswordHash),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const setupMasterPassword = async (req, res, next) => {
  try {
    const { masterPassword } = req.body;

    if (!MASTER_PIN_REGEX.test(String(masterPassword || ""))) {
      res.status(400);
      return next(new Error("Master password must be exactly 6 digits"));
    }

    const user = await User.findById(req.user._id).select("+masterPasswordHash");

    if (user.masterPasswordHash) {
      res.status(400);
      return next(new Error("Master password is already set"));
    }

    const salt = await bcrypt.genSalt(10);
    user.masterPasswordHash = await bcrypt.hash(String(masterPassword), salt);
    await user.save();

    await createActivityLog({
      userId: user._id,
      action: "MASTER_PASSWORD_SET",
      description: "Vault master password was created",
      metadata: {},
    });

    return res.status(201).json({ message: "Master password saved" });
  } catch (error) {
    return next(error);
  }
};

const verifyMasterPassword = async (req, res, next) => {
  try {
    const { masterPassword } = req.body;

    if (!MASTER_PIN_REGEX.test(String(masterPassword || ""))) {
      res.status(400);
      return next(new Error("Master password must be exactly 6 digits"));
    }

    const user = await User.findById(req.user._id).select("+masterPasswordHash");

    if (!user.masterPasswordHash) {
      res.status(400);
      return next(new Error("Create a master password first"));
    }

    const matches = await bcrypt.compare(String(masterPassword), user.masterPasswordHash);

    if (!matches) {
      res.status(401);
      return next(new Error("Invalid master password"));
    }

    const vaultToken = generateVaultToken(user._id);

    await createActivityLog({
      userId: user._id,
      action: "VAULT_UNLOCKED",
      description: "Vault unlocked with master password",
      metadata: {},
    });

    return res.status(200).json({ vaultToken });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  setupMasterPassword,
  verifyMasterPassword,
};
