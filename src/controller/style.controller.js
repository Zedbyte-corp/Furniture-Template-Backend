const StyleModel = require("../model/style.model");
const response = require("../response/response");
const messageResponse = require("../response/messages");
const query = require("../model/query");
const requiredFields = require("../model/fields");
const config = require("../config/aws-s3.config");
const s3helper = require("../helper/aws-s3-upload-images.helper");

// const uuidv4 = require("uuidv4");

// ### create template style as document ###

const createStyle = async (req, res) => {
  // const totalNumberOfDocuments = await StyleModel.estimatedDocumentCount();
  // if (totalNumberOfDocuments === 0) {
  const findDocumentWithStyleId = await StyleModel.find({
    styleId: req.body.styleId,
  });
  if (findDocumentWithStyleId.length === 0) {
    try {
      var timestamp = Date.now().toString();
      const uploadImg = await s3helper.saveBinaryFilePromise(
        {
          path: "Style/" + "_" + timestamp + req.file.originalname,
          bucketName: config.s3CustomerBucketName,
        },
        req.file.buffer
      );
      if (uploadImg) {
        let params = req.body;
        params.logo = decodeURI(uploadImg.Location);
        params.styleId = params.styleId;
        const doc = new StyleModel(params);
        const result = await doc.save();
        const responseObject = response.success(messageResponse.Insert, result);
        return res.status(200).json(responseObject);
      } else {
        const responseObject = response.error(messageResponse.imageError);
        return res.status(200).json(responseObject);
      }
    } catch (error) {
      const responseObject = response.error(error.message);
      res.status(200).json(responseObject);
    }
  } else {
    try {
      let params = req.body;
      let updateValue = {};
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
        const oldResult = await StyleModel.find({
          styleId: params.styleId,
        }).lean();
        const oldResultImage = oldResult[0].logo;
        if (
          oldResultImage !== "" &&
          oldResultImage !== undefined &&
          oldResultImage !== null
        ) {
          const deleteImg = await s3helper.deleteFilePromise({
            path:
              "Style/" +
              oldResultImage.split("/")[oldResultImage.split("/").length - 1],
            bucketName: config.s3CustomerBucketName,
          });
        }
        var timestamp = Date.now().toString();
        const uploadImg = await s3helper.saveBinaryFilePromise(
          {
            path: "Style/" + "_" + timestamp + req.file.originalname,
            bucketName: config.s3CustomerBucketName,
          },
          req.file.buffer
        );

        if (uploadImg) {
          updateValue[`logo`] = decodeURI(uploadImg.Location);
        } else {
          const responseObject = response.error(messageResponse.imageError);
          return res.status(200).json(responseObject);
        }
      }
      const result = await StyleModel.updateOne(
        { styleId: params.styleId },
        {
          $set: updateValue,
        }
      );
      const responseObject = response.success(messageResponse.Insert, result);
      return res.status(200).json(responseObject);
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  }
  // } else {
  //   try {
  //     const findDocumentWithStyleId = await StyleModel.find({
  //       styleId: req.body.styleId,
  //     });
  //     if (findDocumentWithStyleId.length !== 0) {
  //       const responseObject = response.error(
  //         messageResponse.alreadyExits("styleId", req.body.styleId)
  //       );
  //       res.status(200).json(responseObject);
  //     } else if (findDocumentWithStyleId.length === 0) {
  //      const doc = new StyleModel(params);
  //      const result = await doc.save();
  //      const responseObject = response.success(messageResponse.Insert, result);
  //      return res.status(200).json(responseObject);
  //     }
  //   } catch (error) {
  //     const responseObject = response.error(error.message);
  //     res.status(200).json(responseObject);
  //   }
  // }
};

const updateStyle = async (req, res) => {
  try {
    let params = req.body;
    let updateValue = {};
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
      const oldResult = await StyleModel.find({
        styleId: params.styleId,
      }).lean();
      const oldResultImage = oldResult[0].logo;
      if (
        oldResultImage !== "" &&
        oldResultImage !== undefined &&
        oldResultImage !== null
      ) {
        const deleteImg = await s3helper.deleteFilePromise({
          path:
            "Style/" +
            oldResultImage.split("/")[oldResultImage.split("/").length - 1],
          bucketName: config.s3CustomerBucketName,
        });
      }
      var timestamp = Date.now().toString();
      const uploadImg = await s3helper.saveBinaryFilePromise(
        {
          path: "Style/" + "_" + timestamp + req.file.originalname,
          bucketName: config.s3CustomerBucketName,
        },
        req.file.buffer
      );

      if (uploadImg) {
        updateValue[`logo`] = decodeURI(uploadImg.Location);
      } else {
        const responseObject = response.error(messageResponse.imageError);
        return res.status(200).json(responseObject);
      }
    }
    const result = await StyleModel.updateOne(
      { styleId: params.styleId },
      {
        $set: updateValue,
      }
    );
    const responseObject = response.success(messageResponse.Insert, result);
    return res.status(200).json(responseObject);
  } catch (error) {
    const responseObject = response.error(error.message);
    return res.status(200).json(responseObject);
  }
};

// ### get template style from document ###

const getStyle = async (req, res) => {
  try {
    const result = await StyleModel.find({ styleId: req.body.styleId });
    if (result.length !== 0) {
      const responseObject = response.success(
        messageResponse.getOne("style"),
        result
      );
      return res.status(200).json(responseObject);
    } else {
      const responseObject = response.error(messageResponse.noResult("styles"));
      res.status(200).json(responseObject);
    }
  } catch (error) {
    const responseObject = response.error(error.message);
    res.status(200).json(responseObject);
  }
};

module.exports = {
  createStyle,
  updateStyle,
  getStyle,
};
