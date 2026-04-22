const mongoose = require("mongoose");
const VaultItem = require("../models/VaultItem");
const { decryptVaultPassword, encryptVaultPassword } = require("../config/vaultCrypto");
const { createActivityLog } = require("../config/activityLogger");

const toClientVaultItem = (vaultItemDocument) => {
  const item = vaultItemDocument.toObject ? vaultItemDocument.toObject() : { ...vaultItemDocument };
  return {
    ...item,
    password: decryptVaultPassword(item.password),
  };
};

const createVaultItem = async (req, res, next) => {
  try {
    const { title, username, password, notes, fileUrl } = req.body;

    if (!title || !username || !password) {
      res.status(400);
      return next(new Error("Title, username, and password are required"));
    }

    const vaultItem = await VaultItem.create({
      title: title.trim(),
      username: username.trim(),
      password: encryptVaultPassword(password),
      notes: notes ? notes.trim() : "",
      fileUrl: fileUrl ? String(fileUrl).trim() : "",
      userId: req.user._id,
    });
    await createActivityLog({
      userId: req.user._id,
      action: "VAULT_ITEM_CREATED",
      description: `Created vault item "${vaultItem.title}"`,
      metadata: {
        vaultItemId: vaultItem._id,
      },
    });

    return res.status(201).json(toClientVaultItem(vaultItem));
  } catch (error) {
    return next(error);
  }
};

const getVaultItems = async (req, res, next) => {
  try {
    const items = await VaultItem.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(items.map((item) => toClientVaultItem(item)));
  } catch (error) {
    return next(error);
  }
};

const updateVaultItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, username, password, notes, fileUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      return next(new Error("Invalid vault item id"));
    }

    const updateData = {};

    if (title !== undefined) {
      updateData.title = String(title).trim();
    }

    if (username !== undefined) {
      updateData.username = String(username).trim();
    }

    if (password !== undefined) {
      updateData.password = encryptVaultPassword(String(password));
    }

    if (notes !== undefined) {
      updateData.notes = String(notes).trim();
    }

    if (fileUrl !== undefined) {
      updateData.fileUrl = String(fileUrl).trim();
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400);
      return next(new Error("At least one field is required to update"));
    }

    const updatedItem = await VaultItem.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      res.status(404);
      return next(new Error("Vault item not found"));
    }
    await createActivityLog({
      userId: req.user._id,
      action: "VAULT_ITEM_UPDATED",
      description: `Updated vault item "${updatedItem.title}"`,
      metadata: {
        vaultItemId: updatedItem._id,
      },
    });

    return res.status(200).json(toClientVaultItem(updatedItem));
  } catch (error) {
    return next(error);
  }
};

const deleteVaultItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      return next(new Error("Invalid vault item id"));
    }

    const deletedItem = await VaultItem.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deletedItem) {
      res.status(404);
      return next(new Error("Vault item not found"));
    }
    await createActivityLog({
      userId: req.user._id,
      action: "VAULT_ITEM_DELETED",
      description: `Deleted vault item "${deletedItem.title}"`,
      metadata: {
        vaultItemId: deletedItem._id,
      },
    });

    return res.status(200).json({ message: "Vault item deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createVaultItem,
  getVaultItems,
  updateVaultItem,
  deleteVaultItem,
};
