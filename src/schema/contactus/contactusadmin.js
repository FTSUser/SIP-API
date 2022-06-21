const mongoose = require("mongoose");
const enums = require("../../../json/enums.json");

module.exports = (connection) => {
    const contactusadminSchema = new mongoose.Schema({
        name:{ type: String },
        email:{ type: String },
        phone:{ type: String },
        subject:{type:String},
        message:{type:String},
        creationDate: { type: Date, default: Date.now() },
        modificationData: { type: Date, default: Date.now() },
    }, {
        autoCreate: true
    });

    // return logsSchema;
    return connection.model("contactusadmin", contactusadminSchema, "contactusadmin");
};

