const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
  const instructionSchema = new mongoose.Schema(
    {
      title: { type: String, require: true },
      description: { type: String, require: true },
      Aid: { type: mongoose.Schema.Types.ObjectId },
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
  return connection.model("instruction", instructionSchema, "instruction");
};
