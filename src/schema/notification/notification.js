const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
  const notificationSchema = new mongoose.Schema(
    {
      sender: { type: mongoose.Schema.Types.ObjectId },
      userName: { type: String },
      receiver: { type: mongoose.Schema.Types.ObjectId },
      type: { type: String },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      createdBy: {
        type: String,
        default: "Admin",
      },
      updatedBy: {
        type: String,
        default: "Admin",
      },
    },
    {
      autoCreate: true,
    }
  );

  // return logsSchema;
  return connection.model("notification", notificationSchema, "notification");
};
