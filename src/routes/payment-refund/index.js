const express = require("express");
const paymentCtrl = require("../../api/payment-refund/payment-refund");
const Joi = require("joi");
const httpStatus = require("http-status");
const APIResponse = require("../../APIResponse");
const router = express.Router(); // eslint-disable-line new-cap
const { validate } = require("../../middlewares");
const passport = require("passport");


router.post("/createRefund",paymentCtrl.refund);
// router.post("/confirmPayment",  passport.authenticate(["jwt"] ,{ session: false }), paymentCtrl.confirmPayment);


module.exports = router;
