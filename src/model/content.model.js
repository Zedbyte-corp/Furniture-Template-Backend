const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.contentCollection;

const contentSchema = mongoose.Schema({
  styleId:{
    type: Number,
    require: true
  },
  primaryColor:{
    type: String,
    require:true
  },
  secondaryColor:{
    type: String,
    require:true
  },
  primaryFontColor:{
    type: String,
    require:true
  },
  secondaryFontColor:{
    type: String,
    require:true
  },
  primaryButtonColor:{
    type: String,
    require:true
  },
  primaryButtonFontColor:{
    type: String,
    require:true
  },
  fontSize:{
    type: Number,
    require:true
  }
});

const ContntModel = mongoose.model("content", contentSchema, collectionName);
module.exports = ContntModel;
