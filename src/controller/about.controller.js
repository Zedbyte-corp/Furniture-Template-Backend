const AboutModel = require("../model/about.model");
const response = require("../response/response");
const messageResponse = require("../response/messages");
const config = require("../config/aws-s3.config");
const s3helper = require("../helper/aws-s3-upload-images.helper");
const requiredFields = require("../model/fields");
const deleteDirectoryPromise = require("../helper/aws-s3-upload-images.helper");

const createAbout = async (req, res) => {
  const totalNumberOfDocuments = await AboutModel.estimatedDocumentCount();
  if (
    totalNumberOfDocuments === 0 &&
    (req.body.index === "" ||
      req.body.index === null ||
      req.body.index === undefined)
  ) {
    try {
      var timestamp = Date.now().toString();
      const uploadImg = await s3helper.saveBinaryFilePromise(
        {
          path: "About/" + "_" + timestamp + req.file.originalname,
          bucketName: config.s3CustomerBucketName,
        },
        req.file.buffer
      );
      if (uploadImg) {
        let params = req.body;
        params.aboutImage = decodeURI(uploadImg.Location);
        const doc = new AboutModel({ aboutArray: [params] });
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
    try {
      let params = req.body;
      let updateValue = {};
      if (
        params.index !== "" &&
        params.index !== null &&
        params.index !== undefined
      ) {
        let index = params.index - 1;
        delete params.index;
        for (let [key, value] of Object.entries(params)) {
          if (
            value !== "" &&
            value !== null &&
            value !== undefined &&
            value !== "undefined"
          ) {
            updateValue[`aboutArray.${index}.${key}`] = value;
          }
        }
        if (req.file !== null && req.file !== undefined) {
          const oldResult = await AboutModel.find({}).lean();
          const oldResultImage = oldResult[0].aboutArray[index].aboutImage;
          if (
            oldResultImage !== "" &&
            oldResultImage !== undefined &&
            oldResultImage !== null
          ) {
            const deleteImg = await s3helper.deleteFilePromise({
              path:
                "About/" +
                oldResultImage.split("/")[oldResultImage.split("/").length - 1],
              bucketName: config.s3CustomerBucketName,
            });
          }
          var timestamp = Date.now().toString();
          const uploadImg = await s3helper.saveBinaryFilePromise(
            {
              path: "About/" + "_" + timestamp + req.file.originalname,
              bucketName: config.s3CustomerBucketName,
            },
            req.file.buffer
          );

          if (uploadImg) {
            updateValue[`aboutArray.${index}.aboutImage`] = decodeURI(
              uploadImg.Location
            );
          } else {
            const responseObject = response.error(messageResponse.imageError);
            return res.status(200).json(responseObject);
          }
        }
        const result = await AboutModel.updateOne(
          {},
          {
            $set: updateValue,
          }
        );
        const responseObject = response.success(messageResponse.Insert, result);
        return res.status(200).json(responseObject);
      } else {
        var timestamp = Date.now().toString();
        const uploadImg = await s3helper.saveBinaryFilePromise(
          {
            path: "About/" + "_" + timestamp + req.file.originalname,
            bucketName: config.s3CustomerBucketName,
          },
          req.file.buffer
        );
        if (uploadImg) {
          params.aboutImage = decodeURI(uploadImg.Location);
          const result = await AboutModel.updateMany(
            {},
            { $push: { aboutArray: params } }
          );
          const responseObject = response.success(
            messageResponse.Insert,
            result
          );
          return res.status(200).json(responseObject);
        } else {
          const responseObject = response.error(messageResponse.imageError);
          return res.status(200).json(responseObject);
        }
      }
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  }
};

const readAbout = async (req, res) => {
  try {
    let responseObject = {};
    const result = await AboutModel.find({}).lean();
    if (result.length !== 0) {
      responseObject = response.success(
        messageResponse.getOne("About"),
        result
      );
    } else {
      responseObject = response.error(messageResponse.noResult("About"));
    }
    return res.status(200).json(responseObject);
  } catch (error) {
    const responseObject = response.error(error.message);
    return res.status(200).json(responseObject);
  }
};

// const addAbout = async (req, res) => {
//   const totalNumberOfDocuments = await AboutModel.estimatedDocumentCount();
//   if (totalNumberOfDocuments !== 0) {
//     try {
//       var timestamp = Date.now().toString();
//       const uploadImg = await s3helper.saveBinaryFilePromise(
//         {
//           path: "About/" + "_" + timestamp + req.file.originalname,
//           bucketName: config.s3CustomerBucketName,
//         },
//         req.file.buffer
//       );
//       if (uploadImg) {
//         let params = req.body;
//         params.aboutImage = decodeURI(uploadImg.Location);
//         const result = await AboutModel.updateMany(
//           {},
//           { $push: { aboutArray: params } }
//         );
//         const responseObject = response.success(messageResponse.Insert, result);
//         return res.status(200).json(responseObject);
//       } else {
//         const responseObject = response.error(messageResponse.imageError);
//         return res.status(200).json(responseObject);
//       }
//     } catch (error) {
//       const responseObject = response.error(error.message);
//       return res.status(200).json(responseObject);
//     }
//   } else {
//     const responseObject = response.error(messageResponse.emptyDatabase);
//     return res.status(200).json(responseObject);
//   }
// };

const deleteAbout = async (req, res) => {
  const deleteImg = await s3helper.deleteDirectoryPromise({
    path: "About",
    bucketName: config.s3CustomerBucketName,
  });
  if (
    deleteImg.$response.httpResponse.statusCode === 200 ||
    deleteImg.$response.httpResponse.statusCode === 204
  ) {
    try {
      let responseObject = {};
      const result = await AboutModel.deleteMany({});
      if (result.acknowledged) {
        responseObject = response.success(messageResponse.Delete, result);
      } else {
        responseObject = response.error(messageResponse.notDeleted("About"));
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
  createAbout,
  readAbout,
  // addAbout,
  deleteAbout,
};
