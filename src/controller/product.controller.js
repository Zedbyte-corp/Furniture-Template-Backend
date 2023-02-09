const ProductModel = require("../model/product.model");
const response = require("../response/response");
const messageResponse = require("../response/messages");
const query = require("../model/query");
const requiredFields = require("../model/fields");
const s3helper = require("../helper/aws-s3-upload-images.helper");
const deleteDirectoryPromise = require("../helper/aws-s3-upload-images.helper");
const config = require("../config/aws-s3.config");
// const uuidv4 = require("uuidv4");

// ### create template style as document ###

const createProduct = async (req, res) => {
  // const totalNumberOfDocuments = await ProductModel.estimatedDocumentCount();
  // if (totalNumberOfDocuments === 0) {
  const findDocumentWithStyleId = await ProductModel.find({
    productId: req.body.productId,
  });
  if (findDocumentWithStyleId.length === 0) {
    try {
      console.log("request", req);
      var timestamp = Date.now().toString();
      const uploadImg = await s3helper.saveBinaryFilePromise(
        {
          path: "Product/" + "_" + timestamp + req.file.originalname,
          bucketName: config.s3CustomerBucketName,
        },
        req.file.buffer
      );
      if (uploadImg) {
        let params = req.body;
        params.productImage = decodeURI(uploadImg.Location);
        const doc = new ProductModel(params);
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
        const oldResult = await ProductModel.find({
          productId: params.productId,
        }).lean();
        const oldResultImage = oldResult[0].productImage;
        if (
          oldResultImage !== "" &&
          oldResultImage !== undefined &&
          oldResultImage !== null
        ) {
          const deleteImg = await s3helper.deleteFilePromise({
            path:
              "Product/" +
              oldResultImage.split("/")[oldResultImage.split("/").length - 1],
            bucketName: config.s3CustomerBucketName,
          });
        }
        var timestamp = Date.now().toString();
        const uploadImg = await s3helper.saveBinaryFilePromise(
          {
            path: "Product/" + "_" + timestamp + req.file.originalname,
            bucketName: config.s3CustomerBucketName,
          },
          req.file.buffer
        );

        if (uploadImg) {
          updateValue[`productImage`] = decodeURI(uploadImg.Location);
        } else {
          const responseObject = response.error(messageResponse.imageError);
          return res.status(200).json(responseObject);
        }
      }
      const result = await ProductModel.updateOne(
        { productId: params.productId },
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
};

// const createProduct = async (req, res) => {
//   const uploadImg = s3helper.uploadS3(
//     config.s3CustomerBucketName,
//     req.body.productId,
//     "productImage"
//   ).fields([{ name: "productImage", maxCount: 1 }]);
//   uploadImg(req, res, async (err) => {
//     if (err) {
//       const responseObject = response.error(messageResponse.uploadImage(err));
//       return res.status(200).json(responseObject);
//     } else {
//       const product = new ProductModel({
//         productId: req.body.productId,
//         productImage: req.body.productImage,
//         productName: req.files.productImage[0].location,
//         productDescription: req.body.productDescription,
//         productCategoryId: req.body.productCategoryId,
//         productSubcategoryId: req.body.productSubcategoryId,
//       });
//       try {
//         const totalNumberOfDocuments =
//           await ProductModel.estimatedDocumentCount();
//         if (totalNumberOfDocuments === 0) {
//           await product.save();
//           const responseObject = response.success(messageResponse.Insert);
//           return res.status(200).json(responseObject);
//         } else {
//           const findDocumentWithStyleId = await ProductModel.find({
//             productId: req.body.productId,
//           });
//           if (findDocumentWithStyleId.length !== 0) {
//             const responseObject = response.error(
//               messageResponse.alreadyExits("productId", req.body.productId)
//             );
//             res.status(200).json(responseObject);
//           } else if (findDocumentWithStyleId.length === 0) {
//             await product.save();
//             const responseObject = response.success(messageResponse.Insert);
//             return res.status(200).json(responseObject);
//           }
//         }
//       } catch (error) {
//         const responseObject = response.error(error.message);
//         res.status(200).json(responseObject);
//       }
//     }
//   });
// };

const deleteProduct = async (req, res) => {
  const deleteImg = await s3helper.deleteDirectoryPromise({
    path: req.body.productId,
    bucketName: config.s3CustomerBucketName,
  });
  if (
    deleteImg.$response.httpResponse.statusCode === 200 ||
    deleteImg.$response.httpResponse.statusCode === 204
  ) {
    try {
      let responseObject = {};
      let params = req.body;
      let query = { productId: params.productId };

      const result = await ProductModel.deleteOne(query);

      if (result.acknowledged) {
        responseObject = response.success(messageResponse.Delete, result);
      } else {
        responseObject = response.error(
          messageResponse.notDeleted(params.productId)
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

// ### get template products from document ###

const readProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      productCategoryId,
      productSubcategoryId,
    } = req.body;
    if (
      (productCategoryId === null ||
        productCategoryId === "" ||
        productCategoryId === undefined) &&
      (productSubcategoryId === null ||
        productSubcategoryId === "" ||
        productSubcategoryId === undefined)
    ) {
      const result = await ProductModel.find({})
        .select(requiredFields.productFields)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      if (result.length !== 0) {
        const responseObject = response.success(
          messageResponse.getAll("products"),
          result,
          result.length
        );
        return res.status(200).json(responseObject);
      } else {
        const responseObject = response.error(
          messageResponse.noResult("products")
        );
        res.status(200).json(responseObject);
      }
    } else {
      const query = { $and: [] };
      if (
        productCategoryId !== "" &&
        productCategoryId !== null &&
        productCategoryId !== undefined
      ) {
        query["$and"].push({ productCategoryId: req.body.productCategoryId });
      }

      if (
        productSubcategoryId !== "" &&
        productSubcategoryId !== null &&
        productSubcategoryId !== undefined
      ) {
        query["$and"].push({
          productSubcategoryId: req.body.productSubcategoryId,
        });
      }

      console.log("query", JSON.stringify(query));
      const result = await ProductModel.find(query).select(
        requiredFields.productFields
      );
      // console.log(result);
      if (result.length !== 0) {
        const responseObject = response.success(
          messageResponse.getOne("products"),
          result
        );
        return res.status(200).json(responseObject);
      } else {
        const responseObject = response.error(
          messageResponse.noResult("products")
        );
        res.status(200).json(responseObject);
      }
    }
  } catch (error) {
    const responseObject = response.error(error.message);
    res.status(200).json(responseObject);
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  readProducts,
};
