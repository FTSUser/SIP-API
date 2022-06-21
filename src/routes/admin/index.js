const express = require("express");
const router = express.Router();
const adminApi = require("../../api/admin");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
// Users
router.get(
  "/get-users",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.getUsers.handler
);
router.get(
  "/get-admins",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.getAdmins.handler
);
router.get(
  "/get-superadmins",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.getSuperadmins.handler
);
router.get(
  "/get-admin/:id",
  // passport.authenticate(["jwt"], { session: false }),
  adminApi.getAdmin.handler
);
router.get(
  "/count",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.count.handler
);
router.get("/get-request", adminApi.getRequest.handler);
router.get("/get-all-request", adminApi.getAllRequest.handler);
router.get(
  "/getUserDetails",
  //   passport.authenticate(["jwt"], { session: false }),
  adminApi.getUserDetails.handler
);
// Login
router.post(
  "/login",
  validate("body", adminApi.adminLogin.validation),
  adminApi.adminLogin.handler
);

// Signup
router.post(
  "/signup",
  validate("body", adminApi.adminSignup.validation),
  adminApi.adminSignup.handler
);

// Reset Password
router.post(
  "/reset",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", adminApi.resetPassword.validation),
  adminApi.resetPassword.handler
);

// Post Methods
// Users

// // Put Methods
router.put(
  "/block",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", adminApi.blockUser.validation),
  adminApi.blockUser.handler
);

router.put(
  "/updateAdmin/:id",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", adminApi.updateAdmin.validation),
  adminApi.updateAdmin.handler
);

router.put(
  "/isAprove/:id",
  // validate("body", adminApi.isAprove.validation),
  passport.authenticate(["jwt"], { session: false }),
  adminApi.isAprove.handler
);

router.put(
  "/sendQuestionSet",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.sendQuestionSet.handler
);

router.put(
  "/verify-email",
  validate("body", adminApi.verifyEmail.validation),
  adminApi.verifyEmail.handler
);
router.put(
  "/verify-code",
  validate("body", adminApi.verifyCode.validation),
  adminApi.verifyCode.handler
);

router.put(
  "/updateStatus/:id",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.updateStatus.handler
);

router.post(
  "/after-forget",
  validate("body", adminApi.afterforgotPassword.validation),
  adminApi.afterforgotPassword.handler
);

// // Delete Methods
// router.delete("/deleteAdmin/:Id", bannerApi.deleteA.handler);
router.delete(
  "/deleteAdmin/:id",
  passport.authenticate(["jwt"], { session: false }),
  adminApi.deleteAdmin.handler
);

module.exports = exports = router;
