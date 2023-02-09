const express = require("express");
const router = express.Router();
const CategoryController = require("../controller/category.controller");
// const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("categoryImage"),
  CategoryController.createCategory
);
router.post("/update", CategoryController.updateSubCategory);
router.post("/readCategory", CategoryController.readCategory);
router.post("/deleteCategory", CategoryController.deleteCategory);
router.post("/readSubCategory", CategoryController.readSubCategory);
router.post("/deleteSubCategory", CategoryController.deleteSubCategory);

module.exports = router;
