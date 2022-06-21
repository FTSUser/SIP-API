const express = require("express");
const router = express.Router();
const interviewGuideApi = require("../../api/interviewGuide");
const { validate } = require("../../middlewares");
const passport = require("passport");
// const { profileUploadS3 } = require("../../s3FileUpload");

// Get Methods
router.get(
  "/getAllinterviewGuide",
  interviewGuideApi.getAllinterviewGuide.handler
);
router.get(
  "/get-guide-by-category/:id",
  interviewGuideApi.getGuideByCategory.handler
);

// Post Methods
router.post(
  "/addinterviewGuide",
  // profileUploadS3.single("image"),
  // passport.authenticate(["jwt"], { session: false }),
  validate("body", interviewGuideApi.addinterviewGuide.validation),
  interviewGuideApi.addinterviewGuide.handler
);

// // Put Methods
router.put(
  "/updateinterviewGuide/:id",
  // profileUploadS3.single("image"),
  // passport.authenticate(["jwt"], { session: false }),
  interviewGuideApi.updateinterviewGuide.handler
);

// // Delete Methods
router.delete(
  "/deleteinterviewGuide/:id",
  passport.authenticate(["jwt"], { session: false }),
  interviewGuideApi.deleteinterviewGuide.handler
);

module.exports = exports = router;
