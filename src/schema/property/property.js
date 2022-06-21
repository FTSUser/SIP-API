const mongoose = require("mongoose");
 let Schema = mongoose.Schema;
 module.exports = (connection) => {
 
     const propertySchema = new mongoose.Schema(
         {
            adminid: {
                type: Schema.Types.ObjectId,
                ref: "admin"
            },
            wholeHomePrice: Number,
            homeUpgradePrice: Number,
            beds: Number,
            baths: Number,
            sqft: Number,
            address: {
                street: String,
                city: String,
                state: String,
                country: String,
                pincode: String
            },
            aboutHome: String,
            amenities: [
                Schema.Types.ObjectId
            ],
            location: {
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ['Point'], // 'location.type' must be 'Point'
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
            },
            propertyVideo: String,
            property360: String,
            crewContact: String,
            status: String,
            shareStatus: String,
            isDisplay: { type: Boolean, default: true },
            photos: [
                {
                    imgPath: String,
                    meta: String,
                    sequenceNo: Number,
                }
            ],
            monthlyExpenses: {
                propertyTaxes: Number, 
                cleaningFee: Number, 
                propertyManagement: Number, 
                maintenance: Number, 
                utilities: Number, 
                pacasoManagementFee: Number, 
                insurance: Number, 
                repairsReserve: Number, 
            },
                
            creationDate: { type: Date, default: Date.now() },
            modificationData: { type: Date, default: Date.now() },
         },
         {
             autoCreate: true,
         }
     );
 
     // Export
     return connection.model("property", propertySchema, "property");
 };
 