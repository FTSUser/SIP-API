const express = require("express");
const router = express.Router();
const purchasehistoryApi = require("../../api/PurchaseHistory");
const { validate } = require("../../middlewares");
const passport = require("passport");

//Get Method
router.get("/getPurchaseHistoryById/:id", purchasehistoryApi.getPurchaseHistoryById.handler);


// Create Method
router.post("/addPurchaseHistory", passport.authenticate(["jwt"], { session: false }), validate("body", purchasehistoryApi.createPurchaseHistory.validation), purchasehistoryApi.createPurchaseHistory.handler);


//Update method
router.put("/updatePurchaseHistory/:id", passport.authenticate(["jwt"], { session: false }), purchasehistoryApi.updatePurchaseHistory.handler);


module.exports = exports = router;