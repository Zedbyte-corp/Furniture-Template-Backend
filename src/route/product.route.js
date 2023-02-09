const express = require("express");
const router = express.Router();
const ProductController = require("../controller/product.controller");
const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("productImage"),
  ProductController.createProduct
);
router.post("/read", ProductController.readProducts);
router.post("/delete", ProductController.deleteProduct);

module.exports = router;
