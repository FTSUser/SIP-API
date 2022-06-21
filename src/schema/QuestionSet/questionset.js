// const { object } = require("joi");
const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
  const questionsetSchema = new mongoose.Schema(
    {
      Aid: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, require: true },
      menus: [mongoose.Schema.Types.ObjectId],
      subMenus: [mongoose.Schema.Types.ObjectId],
      ListofQuestion: [mongoose.Schema.Types.ObjectId],
      description: { type: String, require: true },
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
  return connection.model("questionset", questionsetSchema, "questionset");
};
