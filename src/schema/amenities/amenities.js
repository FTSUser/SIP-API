
 const mongoose = require("mongoose");
 module.exports = (connection) => {
     const amenitiesSchema = new mongoose.Schema({
         name: { type: String , require: true},
         type: { type: String , require: true},
        //  imagePath: { type: String }
     }, {
         autoCreate: true
     });
 
     // Export
     return connection.model("amenities", amenitiesSchema, "amenities");
 };
 