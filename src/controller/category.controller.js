const CategoryModel = require("../model/category.model");
const response = require("../response/response");
const messageResponse = require("../response/messages");
const query = require("../model/query");
const requiredFields = require("../model/fields");
const uploadS3 = require("../helper/aws-s3-upload-images.helper");
const config = require("../config/aws-s3.config");
const s3helper = require("../helper/aws-s3-upload-images.helper");
// import { v4 as uuidv4 } from 'uuid';

// ### create template style as document ###

const createCategory = async (req, res) => {
  const findDocumentWithStyleId = await CategoryModel.find({
    categoryId: req.body.categoryId,
  });
  let params = req.body;
  if (findDocumentWithStyleId.length === 0) {
    try {
      params.subcategory = [];
      var timestamp = Date.now().toString();
      const uploadImg = await s3helper.saveBinaryFilePromise(
        {
          path: "Category/" + "_" + timestamp + req.file.originalname,
          bucketName: config.s3CustomerBucketName,
        },
        req.file.buffer
      );
      if (uploadImg) {
        params.categoryImage = decodeURI(uploadImg.Location);
        const doc = new CategoryModel(params);
        await doc.save();
        const responseObject = response.success(messageResponse.Insert);
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
    const responseObject = response.error(
      messageResponse.alreadyExits(params.categoryId)
    );
    res.status(200).json(responseObject);
  }
};

// ### update subcategory from document ###

const updateSubCategory = async (req, res) => {
  try {
    const result = await CategoryModel.updateOne(
      { categoryId: req.body.categoryId },
      { $push: { subcategory: req.body.subcategory } }
    );
    console.log("result=>", result);
    if (result.length !== 0) {
      const responseObject = response.success(
        messageResponse.getOne("category"),
        result
      );
      return res.status(200).json(responseObject);
    } else {
      const responseObject = response.error(
        messageResponse.noResult("category")
      );
      res.status(200).json(responseObject);
    }
  } catch (error) {
    const responseObject = response.error(error.message);
    res.status(200).json(responseObject);
  }
};

const readCategory = async (req, res) => {
  const { page = 1, limit = 10 } = req.body;
  try {
    const result = await CategoryModel.find({})
      .select(requiredFields.categoryFields)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    if (result.length !== 0) {
      const responseObject = response.success(
        messageResponse.getAll("Category"),
        result,
        result.length
      );
      return res.status(200).json(responseObject);
    } else {
      const responseObject = response.error(
        messageResponse.noResult("category")
      );
      res.status(200).json(responseObject);
    }
  } catch (error) {
    const responseObject = response.error(error.message);
    res.status(200).json(responseObject);
  }
};

const readSubCategory = async (req, res) => {
  const { categoryId } = req.body;
  try {
    const result = await CategoryModel.find({ categoryId: categoryId }).select(
      requiredFields.SubCategoryFields
    );
    if (result.length !== 0) {
      const responseObject = response.success(
        messageResponse.getAll("SubCategory"),
        result,
        result.length
      );
      return res.status(200).json(responseObject);
    } else {
      const responseObject = response.error(
        messageResponse.noResult("category")
      );
      res.status(200).json(responseObject);
    }
  } catch (error) {
    const responseObject = response.error(error.message);
    res.status(200).json(responseObject);
  }
};

const deleteCategory = async (req, res) => {
  try {
    let responseObject = {};
    let params = req.body;
    let query = { categoryId: params.categoryId };
    const oldResult = await CategoryModel.find(query).lean();
    const oldResultImage = oldResult[0].categoryImage;
    if (
      oldResultImage !== "" &&
      oldResultImage !== undefined &&
      oldResultImage !== null
    ) {
      const deleteImg = await s3helper.deleteFilePromise({
        path:
          "Category/" +
          oldResultImage.split("/")[oldResultImage.split("/").length - 1],
        bucketName: config.s3CustomerBucketName,
      });
    }
    // if (
    //   deleteImg.$response.httpResponse.statusCode === 200 ||
    //   deleteImg.$response.httpResponse.statusCode === 204
    // ) {
    const result = await CategoryModel.deleteOne(query);
    if (result.acknowledged) {
      responseObject = response.success(messageResponse.Delete, result);
    } else {
      responseObject = response.error(messageResponse.notDeleted("Category"));
    }
    return res.status(200).json(responseObject);
    // } else {
    //   responseObject = response.error(
    //     messageResponse.uploadImage(
    //       deleteImg.$response.httpResponse.statusMessage
    //     )
    //   );
    //   return res.status(200).json(responseObject);
    // }
  } catch (error) {
    const responseObject = response.error(error.message);
    return res.status(200).json(responseObject);
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    let responseObject = {};
    let params = req.body;
    let query = { categoryId: params.categoryId };
    let value = {
      $pull: { subcategory: { subcategoryId: params.subcategoryId } },
    };

    const result = await CategoryModel.updateOne(query, value);

    if (result.acknowledged) {
      responseObject = response.success(messageResponse.Delete, result);
    } else {
      responseObject = response.error(
        messageResponse.notDeleted("SubCategory")
      );
    }
    return res.status(200).json(responseObject);
  } catch (error) {
    const responseObject = response.error(error.message);
    return res.status(200).json(responseObject);
  }
};

module.exports = {
  createCategory,
  updateSubCategory,
  readCategory,
  readSubCategory,
  deleteCategory,
  deleteSubCategory,
};
