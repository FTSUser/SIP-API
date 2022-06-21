const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
  const purchasehistorySchema = new mongoose.Schema(
    {
      Aid: { type: String, require: true },
      email: { type: String },
      menus: [mongoose.Schema.Types.ObjectId],
      isPaymentDone: { type: Boolean, default: false },
      PaymentId: { type: Object, default: null },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: Date.now },
      isAprove: { type: Boolean },
      isRequested: { type: Boolean },
      // createdBy: {
      //     type: String,
      //     default: "Admin",
      // },
      // updatedBy: {
      //     type: String,
      //     default: "Admin",
      // },
    },
    {
      autoCreate: true,
    }
  );

  // return logsSchema;
  return connection.model(
    "purchasehistory",
    purchasehistorySchema,
    "purchasehistory"
  );
};
