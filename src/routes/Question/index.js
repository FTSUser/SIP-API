const express = require("express");
const router = express.Router();
const questionApi = require("../../api/Question");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getquestion/:id", questionApi.getQuestion.handler); // params = categoryId / shopId / deviceId
// router.get("/getonequestion/:id", questionApi.getOneQuestion.handler); // params = categoryId / shopId / deviceId
router.post("/getQuestionBySubmenu",   questionApi.getQuestionBySubmenu.handler);

// Post Methods
router.post("/addQuestion", passport.authenticate(["jwt"], { session: false }), validate("body", questionApi.addQuestion.validation), questionApi.addQuestion.handler);

//PUT Methods
router.put("/updateQuestion/:id", passport.authenticate(["jwt"], { session: false }), questionApi.updateQuestion.handler); // params = categoryId / shopId / deviceId

//DELETE Methods
router.delete("/deleteQuestion/:id", passport.authenticate(["jwt"], { session: false }), questionApi.deleteQuestion.handler); // params = categoryId / shopId / deviceId


module.exports = exports = router;
