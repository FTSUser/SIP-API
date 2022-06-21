const express = require("express");
const router = express.Router();
const submenuApi = require("../../api/submenu");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getAllSubMenu/:id", submenuApi.getSubMenu.handler);
router.post("/getSubmenuByMenu", submenuApi.getSubmenuByMenu.handler);
router.get("/getPurchaseSubmenu", submenuApi.getPurchaseSubmenu.handler);
router.post(
  "/getPurchaseSubmenuByMenu",
  submenuApi.getPurchaseSubmenuByMenu.handler
);

// Post Methods
router.post(
  "/addSubMenu",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", submenuApi.addSubMenu.validation),
  submenuApi.addSubMenu.handler
);

// // Put Methods
router.put(
  "/updateSubMenu/:id",
  passport.authenticate(["jwt"], { session: false }),
  submenuApi.updateSubMenu.handler
);

// // Delete Methods
router.delete(
  "/deleteSubMenu/:id",
  passport.authenticate(["jwt"], { session: false }),
  submenuApi.deleteSubMenu.handler
);

module.exports = exports = router;
