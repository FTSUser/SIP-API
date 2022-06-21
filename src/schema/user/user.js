const enums = require("../../../json/enums.json");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = require("mongodb").ObjectId;

module.exports = (connection) => {
  const userSchema = new mongoose.Schema(
    {
      email: { type: String, require: true },
      Aid: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      phone: { type: String },
      currentProfession: { type: String },
      Qsetid: { type: mongoose.Schema.Types.ObjectId },
      ListofQA: [
        {
          Question: String,
          Option: [
            {
              no: Number,
              name: String,
              istrue: Boolean,
            },
            {
              no: Number,
              name: String,
              istrue: Boolean,
            },
            {
              no: Number,
              name: String,
              istrue: Boolean,
            },
            {
              no: Number,
              name: String,
              istrue: Boolean,
            },
          ],
          Answer: [Number],
          type: { type: String, required: true },
          isRight: { type: Boolean },
        },
      ],
      isExamDone: { type: Boolean, default: false },
      total: { type: Number },
      Score: { type: Number },
      percentage: { type: Number },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    {
      autoCreate: true,
    }
  );

  // Export
  return connection.model("user", userSchema, "user");
};
