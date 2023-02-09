const mongoose = require("mongoose");
const config = require("../config/server.config");
const collectionName = config.contactCollection;

const contactSchema = mongoose.Schema({
  contactDescription: {
    type: String,
    require: true,
  },
  contactImage: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  contactAddress: {
    type: String,
    require: true,
  },
  contactPhone: {
    type: String,
    require: true,
  },
  contactEmail: {
    type: String,
    require: true,
  },
});

const ContactModel = mongoose.model("contact", contactSchema, collectionName);
module.exports = ContactModel;
