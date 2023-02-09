const HomeModel = require("../model/home.model");
const CategoryModel = require("../model/category.model");
const ProductModel = require("../model/product.model");
const response = require("../response/response");
const messageResponse = require("../response/messages");
const config = require("../config/aws-s3.config");
const s3helper = require("../helper/aws-s3-upload-images.helper");

const createHome = async (req, res) => {
  const totalNumberOfDocuments = await HomeModel.estimatedDocumentCount();
  if (totalNumberOfDocuments === 0) {
    try {
      console.log(typeof req.files);
      let params = req.body;
      let temp = [];
      let promise = new Promise((res, rej) => {
        Object.entries(req.files).map(async ([key, value]) => {
          for (let i = 0; i < req.files[key].length; i++) {
            let uploadImg = undefined;
            var timestamp = Date.now().toString();
            uploadImg = await s3helper.saveBinaryFilePromise(
              {
                path:
                  "Home/" + "_" + timestamp + req.files[key][i].originalname,
                bucketName: config.s3CustomerBucketName,
              },
              req.files[key][i].buffer
            );
            try {
              if (key === "homeCarousel") {
                temp.push(uploadImg.Location);
              } else {
                params.homeImage = decodeURI(uploadImg.Location);
              }
              if (temp.length === 5) {
                res("success");
              }
            } catch (error) {
              rej(error);
              const responseObject = response.error(error);
              return res.status(200).json(responseObject);
            }
          }
        });
      });
      await promise.then(async (value) => {
        if (value === "success") {
          const doc = new HomeModel({
            homeCarousel: temp,
            homeTrending: params.homeTrending,
            homeImage: params.homeImage,
            homeVideoTitle: params.homeVideoTitle,
            homeVideoUrl: params.homeVideoUrl,
          });
          const result = await doc.save();
          const responseObject = response.success(
            messageResponse.Insert,
            result
          );
          return res.status(200).json(responseObject);
        }
      });
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  } else {
    try {
      let params = req.body;
      let updateValue = {};
      let temp = [];
      let result = undefined;
      let responseObject = undefined;
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
      if (
        req.files !== null &&
        req.files !== undefined &&
        Object.keys(req.files).length !== 0
      ) {
        let promise = new Promise(async (res, rej) => {
          for (let i = 0; i < Object.keys(req.files).length; i++) {
            const deleteImg = await s3helper.deleteDirectoryPromise({
              path: `Home/${Object.keys(req.files)[i]}`,
              bucketName: config.s3CustomerBucketName,
            });
            for (
              let j = 0;
              j < req.files[Object.keys(req.files)[i]].length;
              j++
            ) {
              if (
                req.files[Object.keys(req.files)[i]][j] !== null &&
                req.files[Object.keys(req.files)[i]][j] !== undefined &&
                req.files[Object.keys(req.files)[i]][j] !== ""
              ) {
                let uploadImg = undefined;
                var timestamp = Date.now().toString();
                uploadImg = await s3helper.saveBinaryFilePromise(
                  {
                    path:
                      `Home/${Object.keys(req.files)[i]}` +
                      "_" +
                      timestamp +
                      req.files[Object.keys(req.files)[i]][j].originalname,
                    bucketName: config.s3CustomerBucketName,
                  },
                  req.files[Object.keys(req.files)[i]][j].buffer
                );
                if (
                  uploadImg.Location === "" ||
                  uploadImg.Location === undefined ||
                  uploadImg.Location === null
                ) {
                  rej("error");
                }
                if (Object.keys(req.files)[i] === "homeCarousel") {
                  temp.push(uploadImg.Location);
                } else {
                  // params.homeImage = decodeURI(uploadImg.Location);
                  updateValue.homeImage = decodeURI(uploadImg.Location);
                }
              }
            }
            if (i === Object.keys(req.files).length - 1) {
              if (temp.length !== 0) {
                updateValue.homeCarousel = temp;
              }
              res("success");
            }
          }
        });
        await promise.then(async (value) => {
          if (temp.length !== 0) {
            updateValue.homeCarousel = temp;
          }
          if (value === "success") {
            result = await HomeModel.updateMany(
              {},
              {
                $set: updateValue,
              }
            );
          }
        });
      }
      result = await HomeModel.updateMany(
        {},
        {
          $set: updateValue,
        }
      );
      responseObject = response.success(messageResponse.Insert, result);
      return res.status(200).json(responseObject);
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  }
};

const readHome = async (req, res) => {
  try {
    let responseObject = {};
    let params = req.body;
    let query = {};
    const result = await HomeModel.findOne(query).lean();
    if (result) {
      const categoryResult = await CategoryModel.find({});
      const trendingResult = await ProductModel.find({
        productId: { $in: result.homeTrending },
      });
      if (categoryResult.length !== 0 && trendingResult.length !== 0) {
        result.category = categoryResult;
        result.trending = trendingResult;
        responseObject = response.success(
          messageResponse.getOne("Home"),
          result
        );
      } else {
        responseObject = response.error(messageResponse.noResult("Home"));
      }
    } else {
      responseObject = response.error(messageResponse.noResult("Home"));
    }
    return res.status(200).json(responseObject);
  } catch (error) {
    const responseObject = response.error(error.message);
    return res.status(200).json(responseObject);
  }
};

const updateHomeContents = async (req, res) => {
  const totalNumberOfDocuments = await HomeModel.estimatedDocumentCount();
  if (totalNumberOfDocuments !== 0) {
    try {
      let responseObject = {};
      let params = req.body;
      let query = {};
      let value = {
        $set: {
          homeTrending: params.homeTrending,
          homeVideoUrl: params.homeVideoUrl,
          homeVideoTitle: params.homeVideoTitle,
        },
      };
      const result = await HomeModel.updateMany(query, value);
      if (result.acknowledged) {
        responseObject = response.success(messageResponse.update, result);
      } else {
        responseObject = response.error(messageResponse.Unknown);
      }
      return res.status(200).json(responseObject);
    } catch (error) {
      const responseObject = response.error(error.message);
      return res.status(200).json(responseObject);
    }
  } else {
    const responseObject = response.error(messageResponse.emptyDatabase);
    return res.status(200).json(responseObject);
  }
};

const updateHomeImages = async (req, res) => {
  const totalNumberOfDocuments = await HomeModel.estimatedDocumentCount();
  if (totalNumberOfDocuments !== 0) {
    const deleteImg = await s3helper.deleteDirectoryPromise({
      path: "Home",
      bucketName: config.s3CustomerBucketName,
    });
    if (
      deleteImg.$response.httpResponse.statusCode === 200 ||
      deleteImg.$response.httpResponse.statusCode === 204
    ) {
      try {
        console.log(typeof req.files);
        let params = req.body;
        let temp = [];
        let promise = new Promise((res, rej) => {
          Object.entries(req.files).map(async ([key, value]) => {
            for (let i = 0; i < req.files[key].length; i++) {
              let uploadImg = undefined;
              var timestamp = Date.now().toString();
              uploadImg = await s3helper.saveBinaryFilePromise(
                {
                  path:
                    "Home/" + "_" + timestamp + req.files[key][i].originalname,
                  bucketName: config.s3CustomerBucketName,
                },
                req.files[key][i].buffer
              );
              try {
                if (key === "homeCarousel") {
                  temp.push(uploadImg.Location);
                } else {
                  params.homeImage = decodeURI(uploadImg.Location);
                }
                if (temp.length === 5) {
                  res("success");
                }
              } catch (error) {
                rej(error);
                const responseObject = response.error(error);
                return res.status(200).json(responseObject);
              }
            }
          });
        });
        await promise.then(async (value) => {
          if (value === "success") {
            const result = await HomeModel.updateMany(
              {},
              {
                $set: {
                  homeCarousel: temp,
                  homeImage: params.homeImage,
                },
              }
            );
            const responseObject = response.success(
              messageResponse.Insert,
              result
            );
            return res.status(200).json(responseObject);
          }
        });
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
  } else {
    const responseObject = response.error(messageResponse.emptyDatabase);
    return res.status(200).json(responseObject);
  }
};

const deleteHome = async (req, res) => {
  const deleteImg = await s3helper.deleteDirectoryPromise({
    path: "Home",
    bucketName: config.s3CustomerBucketName,
  });
  if (
    deleteImg.$response.httpResponse.statusCode === 200 ||
    deleteImg.$response.httpResponse.statusCode === 204
  ) {
    try {
      let responseObject = {};
      const result = await HomeModel.deleteMany({});
      if (result.acknowledged) {
        responseObject = response.success(messageResponse.Delete, result);
      } else {
        responseObject = response.error(messageResponse.notDeleted("Home"));
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
  createHome,
  readHome,
  updateHomeContents,
  updateHomeImages,
  deleteHome,
};
