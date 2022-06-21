const mongoose = require("mongoose");

// const enums = require("../../../json/enums.json");

module.exports = (connection) => {
    const submenuSchema = new mongoose.Schema({
        
        name:{ type: String, require:true },
        
        mid:{ type: mongoose.Schema.Types.ObjectId , require:true },
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
    return connection.model("submenu", submenuSchema, "submenu");
};

