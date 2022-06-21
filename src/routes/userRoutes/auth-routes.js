const express = require("express");
const router = express.Router();
const userApi = require("../../api/user/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get(
  "/get-favorites",
  passport.authenticate(["jwt"], { session: false }),
  userApi.getFavorites.handler
);
router.get("/get-cart", userApi.getCart.handler);
router.get("/get-user", userApi.getUser.handler);

// Post Methods
router.post(
  "/sign-up",
  validate("body", userApi.signup.validation),
  userApi.signup.handler
);
router.post(
  "/add-favorites",
  passport.authenticate(["jwt"], { session: false }),
  validate("query", userApi.addFavorites.validation),
  userApi.addFavorites.handler
);
router.post(
  "/add-cart",
  validate("body", userApi.addCart.validation),
  userApi.addCart.handler
);
router.put(
  "/remove-cart",
  validate("query", userApi.removeCart.validation),
  userApi.removeCart.handler
);

// Put Methods
router.put(
  "/update-profile",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", userApi.updateProfile.validation),
  userApi.updateProfile.handler
);
router.put(
  "/remove-favorites",
  passport.authenticate(["jwt"], { session: false }),
  validate("query", userApi.removeFavorites.validation),
  userApi.removeFavorites.handler
);

module.exports = router;
