const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.branchCollection;

const branchSchema = mongoose.Schema({
  branchArray: {
    type: Array,
    require: true,
  },
});

const BranchModel = mongoose.model("branch", branchSchema, collectionName);
module.exports = BranchModel;
