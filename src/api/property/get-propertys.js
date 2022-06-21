const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation

    handler: async (req, res) => {
        
        try {
            const {city , country}=req.body;
            req.query.page = req.query.page ? req.query.page : 1;
            let page = parseInt(req.query.page);
            req.query.limit = req.query.limit ? req.query.limit : 10;
            let limit = parseInt(req.query.limit);
            let skip = (parseInt(req.query.page) - 1) * limit;
            let filter=city?{"address.city":city,"address.country":country}:{};
            let search = req.query.search ?  {$or:[
                {status: { $regex: req.query.search , $options: 'i'}},
                {aboutHome: { $regex: req.query.search , $options: 'i'}}
            ],...filter}: filter;
            const count = await global.models.GLOBAL.PROPERTY.find(search).count();
            const Propertys = await global.models.GLOBAL.PROPERTY.find(search).skip(skip)
            .limit(limit).populate({
                path: "amenities",
                model: "amenities"});
            if(Propertys.length==0){
                const data4createResponseObject = {
                    req: req,
                    result: -400,
                    message: messages.NOT_FOUND,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
                return;
            }
            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.SUCCESS,
                payload: { Propertys:Propertys,count:count },
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

