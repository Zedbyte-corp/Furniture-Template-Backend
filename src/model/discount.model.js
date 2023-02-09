const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.discountCollection;

const discountSchema = mongoose.Schema({
  discountArray: {
    type: Array,
    require: true,
  },
});

const DiscountModel = mongoose.model(
  "discount",
  discountSchema,
  collectionName
);
module.exports = DiscountModel;
