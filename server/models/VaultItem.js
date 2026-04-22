const mongoose = require("mongoose");

const vaultItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [1, "Username cannot be empty"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [1, "Password cannot be empty"],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("VaultItem", vaultItemSchema);
