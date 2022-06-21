const express = require("express");
const router = express.Router();
const instructionApi = require("../../api/instruction");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getAllInstruction", instructionApi.getAllInstruction.handler);
router.get(
  "/getInstructionByAid/:id",
  instructionApi.getInstructionByAid.handler
);

// Post Methods
router.post(
  "/addInstruction",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", instructionApi.addInstruction.validation),
  instructionApi.addInstruction.handler
);

// // Put Methods
router.put(
  "/updateInstruction/:id",
  passport.authenticate(["jwt"], { session: false }),
  instructionApi.updateInstruction.handler
);

// // Delete Methods
router.delete(
  "/deleteInstruction/:id",
  passport.authenticate(["jwt"], { session: false }),
  instructionApi.deleteInstruction.handler
);

module.exports = exports = router;
