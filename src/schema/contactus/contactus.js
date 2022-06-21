const mongoose = require("mongoose");
const enums = require("../../../json/enums.json");

module.exports = (connection) => {
    const contactusSchema = new mongoose.Schema({
        aid: { type: mongoose.Schema.Types.ObjectId ,ref:"admin"},
        pid: { type: mongoose.Schema.Types.ObjectId ,ref:"property"},
        name:{ type: String },
        email:{ type: String },
        phone:{ type: String },
        creationDate: { type: Date, default: Date.now() },
        modificationData: { type: Date, default: Date.now() },
    }, {
        autoCreate: true
    });

    // return logsSchema;
    return connection.model("contactus", contactusSchema, "contactus");
};

