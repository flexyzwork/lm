"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var transactionController_1 = require("../controllers/transactionController");
var router = express_1.default.Router();
router.get("/", transactionController_1.listTransactions);
router.post("/", transactionController_1.createTransaction);
router.post("/stripe/payment-intent", transactionController_1.createStripePaymentIntent);
exports.default = router;
