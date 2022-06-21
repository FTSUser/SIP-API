const express = require("express");
const router = express.Router();
const interviewCategoryApi = require("../../api/interviewCategory");
const { validate } = require("../../middlewares");
const passport = require("passport");
// const { profileUploadS3 } = require("../../s3FileUpload");

// Get Methods
router.get(
  "/getAllinterviewCategory",
  interviewCategoryApi.getAllinterviewCategory.handler
);
// router.get("/getAllMenu", interviewCategoryApi.getAllMenu.handler);

// Post Methods
router.post(
  "/addinterviewCategory",
  // profileUploadS3.single("image"),
  // passport.authenticate(["jwt"], { session: false }),
  validate("body", interviewCategoryApi.addinterviewCategory.validation),
  interviewCategoryApi.addinterviewCategory.handler
);

// // Put Methods
router.put(
  "/updateinterviewCategory/:id",
  // profileUploadS3.single("image"),
  // passport.authenticate(["jwt"], { session: false }),
  interviewCategoryApi.updateinterviewCategory.handler
);

// // Delete Methods
router.delete(
  "/deleteinterviewCategory/:id",
  //   passport.authenticate(["jwt"], { session: false }),
  interviewCategoryApi.deleteinterviewCategory.handler
);

module.exports = exports = router;
