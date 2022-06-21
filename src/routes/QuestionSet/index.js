const express = require("express");
const router = express.Router();
const questionsetApi = require("../../api/QuestionSet");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getQuestionSet", questionsetApi.getQuestionSet.handler); // params = categoryId / shopId / deviceId
// router.get("/getonequestion/:id", questionsetApi.getOneQuestionSet.handler); // params = categoryId / shopId / deviceId
router.get(
  "/getQuestionSetById/:id",
  questionsetApi.getQuestionSetById.handler
); // params = categoryId / shopId / deviceId
router.get(
  "/getQuestionSetByAid/:Aid",
  questionsetApi.getQuestionSetByAid.handler
); // params = categoryId / shopId / deviceId

// Post Methods
router.post(
  "/addQuestionSet",
  passport.authenticate(["jwt"], { session: false }),
  validate("body", questionsetApi.addQuestionSet.validation),
  questionsetApi.addQuestionSet.handler
);

//PUT Methods
router.put(
  "/updateQuestionSet/:id",
  passport.authenticate(["jwt"], { session: false }),
  questionsetApi.updateQuestionSet.handler
); // params = categoryId / shopId / deviceId

//DELETE Methods
router.delete(
  "/deleteQuestionSet/:id",
  passport.authenticate(["jwt"], { session: false }),
  questionsetApi.deleteQuestionSet.handler
); // params = categoryId / shopId / deviceId

module.exports = exports = router;
