const mongoose = require("mongoose");
const enums = require("../../../json/enums.json");

module.exports = (connection) => {
  const adminSchema = new mongoose.Schema(
    {
      email: { type: String },
      password: { type: String },
      fname: { type: String },
      lname: { type: String },
      phone: { type: String },
      company: { type: String },
      companyAddress: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      registrationDate: { type: Date, default: Date.now() },
      modificationData: { type: Date, default: Date.now() },
      role: { type: mongoose.Schema.Types.ObjectId },
      isMenuVisible: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      status: {
        name: {
          type: String,
          enum: [
            enums.USER_STATUS.ACTIVE,
            enums.USER_STATUS.BLOCKED,
            enums.USER_STATUS.DISABLED,
            enums.USER_STATUS.INACTIVE,
            enums.USER_STATUS.INVITED,
          ],
        },
        modificationDate: Date,
      },
    },
    {
      autoCreate: true,
    }
  );

  // return logsSchema;
  return connection.model("admin", adminSchema, "admin");
};
