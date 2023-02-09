const express = require("express");
const router = express.Router();
const ContactController = require("../controller/contact.controller");
const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("contactImage"),
  ContactController.createContact
);
router.post("/read", ContactController.readContact);
router.post("/delete", ContactController.deleteContact);

module.exports = router;
