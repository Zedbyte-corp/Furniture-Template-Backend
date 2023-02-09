const express = require("express");
const router = express.Router();
const BranchController = require("../controller/branch.controller");
const validation = require("../middleware/validate.middleware");
var multer = require("multer");

router.post(
  "/create",
  multer({ storage: multer.memoryStorage() }).single("branchImage"),
  BranchController.createBranch
);

router.post("/read", BranchController.readBranch);
router.post("/delete", BranchController.deleteBranch);

module.exports = router;
