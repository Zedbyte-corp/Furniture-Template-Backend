const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.productCollection;

const productSchema = mongoose.Schema({
  productId:{
    type: String,
    require: true
  },
  productName:{
    type: String,
    require: true
  },
  productImage:{
    type: String,
    require: true
  },
  productDescription:{
    type: String,
    require: true
  },
  productCategoryId:{
    type: String,
    require: true
  },
  productSubcategoryId:{
    type: String,
    require: true

  }  
});

const ProductModel = mongoose.model("product", productSchema, collectionName);
module.exports = ProductModel;
