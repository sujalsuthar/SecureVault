const ActivityLog = require("../models/ActivityLog");

const createActivityLog = async ({ userId, action, description, metadata = {} }) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      description,
      metadata,
    });
  } catch (error) {
    // Activity logging should not block core API actions.
    console.error("Activity log error:", error.message);
  }
};

module.exports = {
  createActivityLog,
};
