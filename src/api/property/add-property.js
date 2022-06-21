const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation
    validation: Joi.object({
        adminid: Joi.string().required(),
        wholeHomePrice: Joi.number().required(),
        homeUpgradePrice: Joi.number().required(),
        beds: Joi.number().required(),
        baths: Joi.number().required(),
        sqft: Joi.number().required(),
        address: Joi.object().required(),
        aboutHome: Joi.string().required(),
        amenities: Joi.array().required(),
        location: Joi.object().required(),
        crewContact: Joi.string().required(),
        status: Joi.string().required(),
        shareStatus: Joi.string().allow(),
        isDisplay: Joi.boolean().required(),
        propertyTaxes: Joi.number().required(), 
        cleaningFee: Joi.number().required(), 
        propertyManagement: Joi.number().required(), 
        maintenance: Joi.number().required(), 
        utilities: Joi.number().required(), 
        pacasoManagementFee: Joi.number().required(), 
        insurance: Joi.number().required(), 
        repairsReserve: Joi.number().required(), 
    }),

    handler: async (req, res) => {
        const { adminid, wholeHomePrice, homeUpgradePrice, beds, baths, sqft, address, aboutHome, amenities, location, propertyVideo, property360, crewContact, status, shareStatus, isDisplay, propertyTaxes, cleaningFee, propertyManagement, maintenance, utilities, pacasoManagementFee, insurance, repairsReserve } = req.body;
        const { user } = req;
        if(user.type == enums.USER_TYPE.USER){
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.NOT_AUTHORIZED,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
        }
        // if (!name || !type) {
        //     const data4createResponseObject = {
        //         req: req,
        //         result: -1,
        //         message: messages.INVALID_PARAMETERS,
        //         payload: {},
        //         logPayload: false
        //     };
        //     return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        // }
        let admin=await global.models.GLOBAL.ADMIN.find({_id:adminid});
        if(!admin || adminid!=user._id){
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.INVALID_PARAMETERS,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
           
        }
        try {
            let createProperty={
                adminid: adminid,
                wholeHomePrice: wholeHomePrice,
                homeUpgradePrice: homeUpgradePrice,
                beds: beds,
                baths: baths,
                sqft: sqft,
                address: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    pincode: address.pincode
                },
                aboutHome: aboutHome,
                amenities: amenities,
                location: {
                type: 'Point',
                coordinates:  [location.lng,location.lat]                    
                },
                propertyVideo: propertyVideo || null,
                property360: property360 || null,
                crewContact: crewContact,
                status: status,
                shareStatus: shareStatus!="null"? shareStatus : null,
                isDisplay: isDisplay,
                monthlyExpenses: {
                    propertyTaxes: propertyTaxes, 
                    cleaningFee: cleaningFee, 
                    propertyManagement: propertyManagement, 
                    maintenance: maintenance, 
                    utilities: utilities, 
                    pacasoManagementFee: pacasoManagementFee, 
                    insurance: insurance, 
                    repairsReserve: repairsReserve, 
                }
            }
            const property = await global.models.GLOBAL.PROPERTY(createProperty);
            property.save();
            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.ITEM_INSERTED,
                payload: { property },
                logPayload: false
            };
            res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
        } catch (error) {
            logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.GENERAL,
                payload: {},
                logPayload: false
            };
            res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
        }
    }
};
