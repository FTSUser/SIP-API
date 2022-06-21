const express = require("express");
const router = express.Router();
const notificationApi = require("../../api/notification/index");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getNotification", notificationApi.getNotification.handler);
router.delete(
  "/deleteNotification",
  notificationApi.deleteNotification.handler
);

module.exports = exports = router;
