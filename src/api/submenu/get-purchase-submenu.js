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
      let id = req.query.id;

      let search = req.query.search
        ? { name: { $regex: req.query.search, $options: "i" } }
        : {};
      const PURCHASEHISTORYDATA =
        await global.models.GLOBAL.PURCHASEHISTORY.find({
          Aid: id,
          isAprove: true,
        }).sort({ startDate: -1 });
      // console.log("PURCHASEHISTORYDATA",PURCHASEHISTORYDATA[0].menus )
      try {
        search = req.query.id
          ? { ...search, _id: { $in: PURCHASEHISTORYDATA[0].menus } }
          : search;
      } catch (e) {
        const data4createResponseObject = {
          req: req,
          result: -400,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
        return;
      }
      const count = await global.models.GLOBAL.SUBMENU.find(search).count();
      let Menus = await global.models.GLOBAL.SUBMENU.find(search).sort({
        createdAt: -1,
      });
      if (Menus.length > 0) {
        Menus = Menus.sort((a, b) => {
          if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
          }
          if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
          }
          return 0;
        });
      }
      let submenus = await global.models.GLOBAL.SUBMENU.find(search).distinct(
        "mid"
      );
      let menus = await global.models.GLOBAL.MENU.find({
        _id: { $in: submenus },
      });
      if (menus.length > 0) {
        menus = menus.sort((a, b) => {
          if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
          }
          if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
          }
          return 0;
        });
      }
      console.log("Menus", Menus);
      // const findAprove = await  global.models.GLOBAL.ADMIN.find({isAprove: true})
      // if(!findAprove){
      //     const data4createResponseObject = {
      //         req: req,
      //         result: -400,
      //         message: messages.NOT_FOUND,
      //         payload: {},
      //         logPayload: false
      //     };
      //     res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      //     return;
      // }else{
      if (Menus.length == 0) {
        const data4createResponseObject = {
          req: req,
          result: -400,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
        return;
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { Menu: Menus, menus: menus, count: count },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
