/**
 * Created by Bhargav Butani on 02.09.2021.
 */
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Users from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    console.log("1", user);
    email = req.query.email;

    if (
      user.type != enums.USER_TYPE.ADMIN &&
      user.type != enums.USER_TYPE.SUPERADMIN
    ) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_AUTHORIZED,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    try {
      console.log("2");

      let rolesuperadmin = await global.models.GLOBAL.ROLE.findOne({
        roleName: "superadmin",
      });
      let roleadmin = await global.models.GLOBAL.ROLE.findOne({
        roleName: "admin",
      });
      let Menu = await global.models.GLOBAL.MENU.find({}).count();
      let Submenu = await global.models.GLOBAL.SUBMENU.find({}).count();
      let submenus = await global.models.GLOBAL.PURCHASEHISTORY.find({
        email: email,
        isAprove: true,
        isPaymentDone: true,
      }).distinct("menus");
      let adminMenu = await global.models.GLOBAL.SUBMENU.find({
        _id: { $in: submenus },
      }).distinct("_id");
      let SubmenuAdmin = await global.models.GLOBAL.SUBMENU.find({
        _id: { $in: submenus },
      }).distinct("mid");
      let Menuadmin = await global.models.GLOBAL.MENU.find({
        _id: { $in: SubmenuAdmin },
      }).distinct("_id");
      // let checkMenu = await global.models.GLOBAL.PURCHASEHISTORY.find({
      //   email: email,
      //   menus: { $in: adminMenu },
      //   isAprove: true,
      //   isPaymentDone: true,
      // });
      // let Menuadmin;
      // // console.log("3, checkMenu", checkMenu);
      // for (let i = 0; i < checkMenu.length; i++) {
      //   Menuadmin = await global.models.GLOBAL.MENU.find({
      //     _id: { $in: checkMenu[i].menus },
      //   }).distinct("_id");
      // }
      // console.log("5", Menuadmin);
      // Menuadmin = Menuadmin ? Menuadmin : [];
      // let submenu = await global.models.GLOBAL.SUBMENU.find({
      //   mid: { $in: Menuadmin },
      // }).count();

      // console.log("submenu", submenu);
      // let findSubmenu = await global.models.GLOBAL.SUBMENU.find({
      //   mid: { $in: Menuadmin },
      // });
      // console.log("findSubMenu", findSubmenu);
      let Sid = await global.models.GLOBAL.QUESTION.find({
        Sid: { $in: adminMenu },
      }).distinct("Sid");
      let question = await global.models.GLOBAL.QUESTION.find({
        Sid: { $in: Sid },
      });
      // console.log("question", question);
      let Question = await global.models.GLOBAL.QUESTION.find({}).count();
      let InterviewCategory = await global.models.GLOBAL.INTERVIEWCATEGORY.find(
        {}
      ).distinct("_id");

      InterviewGuide = await global.models.GLOBAL.INTERVIEWGUIDE.find({
        icid: { $in: InterviewCategory },
      }).count();

      // let roleuser=await global.models.GLOBAL.ROLE.findOne({roleName:"user"});
      const superadmindata = await global.models.GLOBAL.ADMIN.find({
        role: rolesuperadmin._id,
      }).count();
      const admindata = await global.models.GLOBAL.ADMIN.find({
        role: roleadmin._id,
      }).count();
      // const menudata = await global.models.GLOBAL.MENU.find({}).count();
      // const submenudata = await global.models.GLOBAL.SUBMENU.find({ }).count();
      // const questiondata = await global.models.GLOBAL.QUESTION.find({ }).count();

      // const contactus = await global.models.GLOBAL.CONTACTUS.find({}).count();
      const contactusadmin = await global.models.GLOBAL.CONTACTUSADMIN.find(
        {}
      ).count();

      // let countProperty=await global.models.GLOBAL.PROPERTY.aggregate([
      //     {
      //       '$group': {
      //         '_id': {
      //           '$month': '$creationDate'
      //         },
      //         'count': {
      //           '$sum': 1
      //         }
      //       }
      //     }
      //   ]);

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          superadmindata,
          admindata,
          Menu: Menu,
          // menu: Menuadmin.length,
          // submenu,
          menu: Menuadmin.length,
          submenu: adminMenu.length,
          Submenu: Submenu,
          question: question.length,
          Question: Question,
          contactusadmin,
          InterviewGuide,
        },
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
