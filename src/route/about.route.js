const express = require("express");
const router = express.Router();
const AboutController = require("../controller/about.controller");
const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("aboutImage"),
  AboutController.createAbout
);
// router.post(
//   "/add",
//   multer({ storage: multer.memoryStorage() }).single("aboutImage"),
//   AboutController.addAbout
// );
router.post("/read", AboutController.readAbout);
router.post("/delete", AboutController.deleteAbout);

module.exports = router;
