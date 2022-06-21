/**
 * Created by Bhargav Butani on 16.07.2021
 */
const _ = require("lodash");
const Joi = require("joi");
const ObjectId = require("mongodb").ObjectId;
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");
const utils = require("../../utils");
const jwtOptions = require("../../auth/jwt-options");
const role = require("../../routes/role");

module.exports = exports = {
  // router validation
  validation: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    company: Joi.string().allow(""),
    companyAddress: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    zipcode: Joi.string().allow(""),
    isActive: Joi.boolean(),
    role: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    let {
      email,
      password,
      phone,
      fname,
      lname,
      company,
      companyAddress,
      city,
      state,
      zipcode,
      isActive,
      role,
    } = req.body;
    console.log("password-----req", password);
    if (!email || !password || !phone || !lname || !fname || !role) {
      logger.error(messages.FILL_DETAILS);
      const data4createResponseObject = {
        req: req,
        result: -400,
        message: messages.FILL_DETAILS,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
      return;
    }

    //  // salting a password
    //  const salt = await bcrypt.genSalt(10);
    //  const hash = await bcrypt.hash(password, salt);
    //  const isMatch = await bcrypt.compare(password, user.password);

    // check if email already exist
    const emailExist = await global.models.GLOBAL.ADMIN.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (emailExist) {
      const data4createResponseObject = {
        req: req,
        result: -400,
        message: messages.EXISTS_EMAIL,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.DUPLICATE_VALUE)
        .json(utils.createResponseObject(data4createResponseObject));
      return;
    }

    /* Save into mongodb */
    const uid = new ObjectId();
    const adminObject = {
      _id: uid,
      email: email,
      password: password,
      phone: phone,
      fname: fname,
      lname: lname,
      company: company,
      companyAddress: companyAddress,
      city: city,
      state: state,
      zipcode: zipcode,
      isActive: isActive,
      role: ObjectId(role).toString(),
      status: {
        name: enums.USER_STATUS.ACTIVE,
        modificationDate: Date.now().toString(),
      },
      modificationDate: Date.now(),
      registractionDate: Date.now(),
    };

    const newAdmin = global.models.GLOBAL.ADMIN(adminObject);

    try {
      await newAdmin.save();
    } catch (error) {
      logger.error(
        "/admin - Error encountered while trying to add new admin:\n" + error
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_REGISTRATION,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
      return;
    }

    const data4token = {
      email: email,
      date: new Date(),
      scope: "verification",
    };

    const payload = {
      admin: {
        id: adminObject._id,
        email: adminObject.email,
        status: adminObject.status,
        phone: adminObject.phone,
        fname: adminObject.fname,
        lname: adminObject.lname,
        company: adminObject.company,
        companyAddress: adminObject.companyAddress,
        city: adminObject.city,
        state: adminObject.state,
        zipcode: adminObject.zipcode,
        isActive: adminObject.isActive,
      },
      token: jwt.sign(data4token, jwtOptions.secretOrKey),
      token_type: "Bearer",
    };

    const data4createResponseObject = {
      req: req,
      result: 0,
      message: messages.REGISTER_SUCCESS,
      payload: payload,
      logPayload: false,
    };
    res
      .status(enums.HTTP_CODES.OK)
      .json(utils.createResponseObject(data4createResponseObject));
  },
};
