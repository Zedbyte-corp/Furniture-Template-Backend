const express = require("express");
const router = express.Router();
const HomeController = require("../controller/home.controller");
const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).fields([
    { name: "homeCarousel", maxCount: 5 },
    { name: "homeImage", maxCount: 1 },
  ]),
  HomeController.createHome
);
router.post("/updateContent", HomeController.updateHomeContents);
router.post(
  "/updateImages",
  multer({ storage: multer.memoryStorage() }).fields([
    { name: "homeCarousel", maxCount: 5 },
    { name: "homeImage", maxCount: 1 },
  ]),
  HomeController.updateHomeImages
);
router.post("/read", HomeController.readHome);
router.post("/delete", HomeController.deleteHome);

module.exports = router;
