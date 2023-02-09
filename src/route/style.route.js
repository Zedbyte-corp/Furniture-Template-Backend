const express = require("express");
const router = express.Router();
const StyleController = require("../controller/style.controller");
var multer = require("multer");

// const validation = require("../middleware/validate.middleware");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("logo"),
  StyleController.createStyle
);
router.post(
  "/update",
  multer({ storage: multer.memoryStorage() }).single("logo"),
  StyleController.updateStyle
);
router.post("/get", StyleController.getStyle);

module.exports = router;
