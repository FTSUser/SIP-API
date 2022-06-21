const enums = require("../../../json/enums.json");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require("mongodb").ObjectId;

module.exports = (connection) => {
  const userQuestionsetSchema = new mongoose.Schema(
    {
      email: { type: String, require: true },
      Qsetid: { type: mongoose.Schema.Types.ObjectId },
    },
    {
      autoCreate: true,
    }
  );

  // Export
  return connection.model(
    "userQuestionset",
    userQuestionsetSchema,
    "userQuestionset"
  );
};
