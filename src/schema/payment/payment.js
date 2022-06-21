const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
    const paymentSchema = new mongoose.Schema({
        Aid: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: "Admin",
        },
        PaymentId: {
            type: String,
            required: false,
            default: null
        },
        menus: [mongoose.Schema.Types.ObjectId],
        email: {
            type: String,
            required: true,
        },
        paymentAmount: {
            type: String,
            required: true,
        },
        paymentIntent: {
            type: Object
        },
        created: {
            type: Date,
            default: Date.now,
        },
        updated: {
            type: Date,
            default: Date.now,
        },
    }, {
        autoCreate: true, versionKey: false
    });

    // return logsSchema;
    return connection.model("payment", paymentSchema, "payment");
};

