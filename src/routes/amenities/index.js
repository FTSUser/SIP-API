const express = require("express");
const router = express.Router();
const amenitiesApi = require("../../api/amenities");
const { validate } = require("../../middlewares");
const passport = require("passport");

// Get Methods
router.get("/getAmenities", amenitiesApi.getAmenities.handler);

// Post Methods
router.post("/addAmenities", passport.authenticate(["jwt"], { session: false }), validate("body", amenitiesApi.addAmenities.validation), amenitiesApi.addAmenities.handler);

// // Put Methods
router.put("/updateAmenities/:id", passport.authenticate(["jwt"], { session: false }), amenitiesApi.updateAmenities.handler);

// // Delete Methods
router.delete("/deleteAmenities/:id", passport.authenticate(["jwt"], { session: false }), amenitiesApi.deleteAmenities.handler);

module.exports = exports = router;
