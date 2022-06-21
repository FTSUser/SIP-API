const express = require("express");
const router = express.Router();
const thankyouApi = require("../../api/thankyou");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getAllThank", thankyouApi.getAllThank.handler);
router.get("/getThankByAid/:id", thankyouApi.getThankByAid.handler);

// Post Methods
router.post(
  "/addThank",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", thankyouApi.addThank.validation),
  thankyouApi.addThank.handler
);

// // Put Methods
router.put(
  "/updateThank/:id",
  passport.authenticate(["jwt"], { session: false }),
  thankyouApi.updateThank.handler
);

// // Delete Methods
router.delete(
  "/deleteThank/:id",
  passport.authenticate(["jwt"], { session: false }),
  thankyouApi.deleteThank.handler
);

module.exports = exports = router;
