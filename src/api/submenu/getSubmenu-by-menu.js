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
            req.query.page = req.query.page ? req.query.page : 1;
            let page = parseInt(req.query.page);
            req.query.limit = req.query.limit ? req.query.limit : 10;
            let limit = parseInt(req.query.limit);
            let skip = (parseInt(req.query.page) - 1) * limit;

            let ids=req.body.menus;

            
            let search = req.query.search ? {name: { $regex: req.query.search , $options: 'i'},mid:{$in:ids}} : {mid:{$in:ids}};
            
            const Menus = await global.models.GLOBAL.MENU.find({_id:{$in:ids}})
            // console.log("tttttttttt", Menus)
            const count = await global.models.GLOBAL.SUBMENU.find(search).count();
            const subMenus = await global.models.GLOBAL.SUBMENU.find(search).skip(skip).limit(limit);
            if(subMenus.length==0){
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
                payload: { subMenu:subMenus ,Menu:Menus,count:count},
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
