const getUsers = require("./get-users");
const getAdmin = require("./get-admin");
const getAdmins = require("./get-admins");
const getSuperadmins = require("./get-superadmins");
const getUserDetails = require("./get-user-details");
const updateAdmin = require("./update-admin");
const updateStatus = require("./update-status");
const adminLogin = require("./admin-login");
const adminSignup = require("./admin-signup");
const blockUser = require("./block-user");
const count = require("./count");
const resetPassword = require("./reset-Password");
const deleteAdmin = require("./delete-admin");
// const forgotPassword = require("./forgot-password")
const afterforgotPassword = require("./after-forgot");
const verifyCode = require("./verify-code");
const verifyEmail = require("./verify-email");
const isAprove = require("./isAprove");
const getRequest = require("./get-request");
const getAllRequest = require("./get-all-request");
const sendQuestionSet = require("./send-questionSet");

module.exports = exports = {
  getUsers,
  getAdmin,
  getAdmins,
  getSuperadmins,
  getUserDetails,
  updateAdmin,
  updateStatus,
  adminLogin,
  adminSignup,
  blockUser,
  count,
  resetPassword,
  deleteAdmin,
  afterforgotPassword,
  verifyCode,
  verifyEmail,
  isAprove,
  getRequest,
  getAllRequest,
  sendQuestionSet,
};
