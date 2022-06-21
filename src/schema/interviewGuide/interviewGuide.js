const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
  const interviewGuideSchema = new mongoose.Schema(
    {
      icid: { type: mongoose.Schema.Types.ObjectId },
      image: { type: String, require: true },
      guide: [
        { name: { type: String, require: true }, description: { type: Array } },
      ],
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
  return connection.model(
    "interviewGuide",
    interviewGuideSchema,
    "interviewGuide"
  );
};
