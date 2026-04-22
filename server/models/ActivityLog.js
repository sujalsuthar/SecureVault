const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
      maxlength: [60, "Action cannot be longer than 60 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot be longer than 200 characters"],
    },
    metadata: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
