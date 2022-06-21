const express = require("express");
const router = express.Router();
const propertyApi = require("../../api/property");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getpropertys", propertyApi.getProperty.handler); // params = categoryId / shopId / deviceId
router.get("/getOneProperty/:id", propertyApi.getOneProperty.handler); // params = categoryId / shopId / deviceId
router.get("/getLocationFilter", propertyApi.getLocationFiler.handler); // params = categoryId / shopId / deviceId
router.get("/getCountPropertyMonthly", propertyApi.countPropertyMonthly.handler); // params = categoryId / shopId / deviceId

// Post Methods
router.post("/addProperty", passport.authenticate(["jwt"], { session: false }), validate("body", propertyApi.addProperty.validation), propertyApi.addProperty.handler);

//PUT Methods
router.put("/updateProperty/:pid",passport.authenticate(["jwt"], { session: false }), validate("body", propertyApi.updateProperty.validation), propertyApi.updateProperty.handler); // params = categoryId / shopId / deviceId

//DELETE Methods
router.delete("/deleteProperty/:id",passport.authenticate(["jwt"], { session: false }), propertyApi.deleteProperty.handler); // params = categoryId / shopId / deviceId


module.exports = exports = router;
