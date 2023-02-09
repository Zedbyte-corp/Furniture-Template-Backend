const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.homeCollection;

const HomeSchema = mongoose.Schema({
  homeCarousel: {
    type: Array,
    require: true,
  },
  homeTrending: {
    type: Array,
    require: true,
  },
  homeImage: {
    type: String,
    require: true,
  },
  homeVideoTitle: {
    type: String,
    require: true,
  },
  homeVideoUrl: {
    type: String,
    require: true,
  },
});

const HomeModel = mongoose.model("Home", HomeSchema, collectionName);
module.exports = HomeModel;
