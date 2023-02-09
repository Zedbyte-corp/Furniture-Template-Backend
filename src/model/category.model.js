const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.categoryCollection;

const categorySchema = mongoose.Schema({
  categoryId: {
    type: String,
    require: true,
  },
  categoryImage: {
    type: String,
    require: true,
  },
  categoryDescription: {
    type: String,
    require: true,
  },
  categoryName: {
    type: String,
    require: true,
  },
  subcategory: {
    type: Array,
    // require: true
  },
  subcategoryId: {
    type: String,
  },
  subcategoryName: {
    type: String,
  },
});

const CategoryModel = mongoose.model(
  "category",
  categorySchema,
  collectionName
);
module.exports = CategoryModel;
