const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
    const questionSchema = new mongoose.Schema({
        Sid: { type: mongoose.Schema.Types.ObjectId },
        Qname: { type: String, require: true },

        Option: [{
            no: Number,
            name: String,
            istrue: Boolean
        }, {
            no: Number,
            name: String,
            istrue: Boolean
        }, {
            no: Number,
            name: String,
            istrue: Boolean
        }, {
            no: Number,
            name: String,
            istrue: Boolean
        },],
        type: { type: String, required: true },
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
    }, {
        autoCreate: true
    });

    // return logsSchema;
    return connection.model("question", questionSchema, "question");
};

