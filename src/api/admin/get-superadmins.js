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
        console.log("1", user)

        if (user.type !== enums.USER_TYPE.SUPERADMIN) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.NOT_AUTHORIZED,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
        }
        try {
            // console.log("2")

            req.query.page = req.query.page ? req.query.page : 1;
            let page = parseInt(req.query.page);
            req.query.limit = req.query.limit ? req.query.limit : 10;
            let limit = parseInt(req.query.limit);
            let skip = (parseInt(page) - 1) * limit;

            let search = req.query.search ? { $or: [{ fname: { $regex: req.query.search, $options: "i" } }, { lname: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }, { phone: { $regex: req.query.search, $options: "i" } }] } : {};
            console.log(search)


            let rolename = await global.models.GLOBAL.ROLE.findOne({ roleName: "superadmin" });
            const count = await global.models.GLOBAL.ADMIN.find({ role: rolename._id, ...search }).count();
            let admin = await global.models.GLOBAL.ADMIN.find({ role: rolename._id, ...search }, {
                fname: 1,
                lname: 1,
                email: 1,
                status: 1,
                phone: 1,
                registrationDate: 1,
                modificationDate: 1
            });
            // console.log("3")

            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.SUCCESS,
                payload: { admin: admin, count: count },
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
