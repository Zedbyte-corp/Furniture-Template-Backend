const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.aboutCollection;

const aboutSchema = mongoose.Schema({
  aboutArray: {
    type: Array,
    require: true,
  },
});

const AboutModel = mongoose.model("about", aboutSchema, collectionName);
module.exports = AboutModel;
