const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
    const paymentrefundSchema = new mongoose.Schema({
        Aid: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: "Admin",
        },
        PaymentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        paymentIntent: {
            type:Object
        },
        charge:{
            type:Object
        },
        refundId:{
            type:mongoose.Schema.Types.ObjectId
        },
        email: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default:false
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
    return connection.model("paymentrefund", paymentrefundSchema, "paymentrefund");
};

