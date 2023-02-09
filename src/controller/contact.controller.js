const ContactModel = require("../model/contact.model");
const response = require("../response/response");
const messageResponse = require("../response/messages");
const requiredFields = require("../model/fields");
const config = require("../config/aws-s3.config");
const s3helper = require("../helper/aws-s3-upload-images.helper");
const deleteDirectoryPromise = require("../helper/aws-s3-upload-images.helper");

const createContact = async (req, res) => {
  const totalNumberOfDocuments = await ContactModel.estimatedDocumentCount();
  if (totalNumberOfDocuments === 0) {
    try {
      var timestamp = Date.now().toString();
      const uploadImg = await s3helper.saveBinaryFilePromise(
        {
          path: "Contact/" + "_" + timestamp + req.file.originalname,
          bucketName: config.s3CustomerBucketName,
        },
        req.file.buffer
      );
      if (uploadImg) {
        let params = req.body;
        params.contactImage = decodeURI(uploadImg.Location);
        const doc = new ContactModel(params);
        const result = await doc.save();
        const responseObject = response.success(messageResponse.Insert, result);
        return res.status(200).json(responseObject);
      } else {
        const responseObject = response.error(messageResponse.imageError);
        return res.status(200).json(responseObject);
      }
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  } else {
    let updateValue = {};
    let params = req.body;
    for (let [key, value] of Object.entries(params)) {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value !== "undefined"
      ) {
        updateValue[`${key}`] = value;
      }
    }
    if (req.file !== null && req.file !== undefined) {
      const deleteImg = await s3helper.deleteDirectoryPromise({
        path: "Contact",
        bucketName: config.s3CustomerBucketName,
      });
      if (
        deleteImg.$response.httpResponse.statusCode === 200 ||
        deleteImg.$response.httpResponse.statusCode === 204
      ) {
        var timestamp = Date.now().toString();
        const uploadImg = await s3helper.saveBinaryFilePromise(
          {
            path: "Contact/" + "_" + timestamp + req.file.originalname,
            bucketName: config.s3CustomerBucketName,
          },
          req.file.buffer
        );
        if (uploadImg) {
          updateValue.contactImage = decodeURI(uploadImg.Location);
        } else {
          const responseObject = response.error(messageResponse.imageError);
          return res.status(200).json(responseObject);
        }
      }
    }
    const result = await ContactModel.updateOne(
      {},
      {
        $set: updateValue,
      }
    );
    const responseObject = response.success(messageResponse.Insert, result);
    return res.status(200).json(responseObject);
  }
};

const readContact = async (req, res) => {
  try {
    let responseObject = {};
    const result = await ContactModel.find({}).lean();
    if (result.length !== 0) {
      responseObject = response.success(
        messageResponse.getOne("Contact us"),
        result
      );
    } else {
      responseObject = response.error(messageResponse.noResult("Contact us"));
    }
    return res.status(200).json(responseObject);
  } catch (error) {
    const responseObject = response.error(error.message);
    return res.status(200).json(responseObject);
  }
};

const deleteContact = async (req, res) => {
  const deleteImg = await s3helper.deleteDirectoryPromise({
    path: "Contact",
    bucketName: config.s3CustomerBucketName,
  });
  if (
    deleteImg.$response.httpResponse.statusCode === 200 ||
    deleteImg.$response.httpResponse.statusCode === 204
  ) {
    try {
      let responseObject = {};
      const result = await ContactModel.deleteMany({});
      if (result.acknowledged) {
        responseObject = response.success(messageResponse.Delete, result);
      } else {
        responseObject = response.error(
          messageResponse.notDeleted("Contact us")
        );
      }
      return res.status(200).json(responseObject);
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  } else {
    const responseObject = response.error(
      messageResponse.uploadImage(
        deleteImg.$response.httpResponse.statusMessage
      )
    );
    return res.status(200).json(responseObject);
  }
};

module.exports = {
  createContact,
  readContact,
  deleteContact,
};
