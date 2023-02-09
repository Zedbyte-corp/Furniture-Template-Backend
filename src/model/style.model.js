const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.styleCollection;

const styleSchema = mongoose.Schema({
  styleId: {
    type: Number,
    require: true,
  },
  primaryColor: {
    type: String,
    require: true,
  },
  secondaryColor: {
    type: String,
    require: true,
  },
  primaryFontColor: {
    type: String,
    require: true,
  },
  secondaryFontColor: {
    type: String,
    require: true,
  },
  footerWeekdays: {
    type: String,
    require: true,
  },
  footerWeekends: {
    type: String,
    require: true,
  },
  footerDescription: {
    type: String,
    require: true,
  },
  logo: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  playstore: {
    type: String,
    require: true,
  },
  appstore: {
    type: String,
    require: true,
  },
  facebook: {
    type: String,
    require: true,
  },
  instagram: {
    type: String,
    require: true,
  },
  twitter: {
    type: String,
    require: true,
  },
  whatsapp: {
    type: String,
    require: true,
  },
  telephone: {
    type: String,
    require: true,
  },
});

const StyleModel = mongoose.model("style", styleSchema, collectionName);
module.exports = StyleModel;
