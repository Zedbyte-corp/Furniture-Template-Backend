const express = require("express");
const router = express.Router();
const DiscountController = require("../controller/discount.controller");
const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("discountImage"),
  DiscountController.createDiscount
);

router.post("/read", DiscountController.readDiscount);
router.post("/delete", DiscountController.deleteDiscount);

module.exports = router;
