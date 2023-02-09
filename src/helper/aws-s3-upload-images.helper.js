const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3config = require("../config/aws-s3.config");

const s3 = new aws.S3({
  accessKeyId: s3config.s3AccessKey,
  secretAccessKey: s3config.s3SecretAccessKey,
  region: s3config.s3BucketRegion,
});

const uploadS3 = (bucketName, folderName, imageName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: `${bucketName}/${folderName}`,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `${imageName} ${Date.now()}`);
      },
    }),
  });

function normalizeRootPath(filePath) {
  filePath = filePath.replace(new RegExp("//+", "g"), "/");
  filePath = filePath.replace("\\", "/");
  if (filePath.indexOf("/") === 0) {
    filePath = filePath.substr(1);
  }
  return decodeURIComponent(filePath);
}

async function isFileExist(param) {
  try {
    return s3
      .headObject({
        Bucket: param.bucketName,
        Key: normalizeRootPath(param.path),
      })
      .promise()
      .then(
        (value) => {
          console.log(value);
          return true;
        },
        (err) => {
          if (err.code === "NotFound") {
            return false;
          }
          throw err;
        }
      );
  } catch (error) {
    return Promise.resolve(false);
  }
}

async function saveBinaryFilePromise(
  param,
  content,
  overWrite,
  onUploadProgress,
  onAbort
) {
  // let isNewFile = false;
  const filePath = normalizeRootPath(param.path);
  // const result = await isFileExist(param);

  // if (result === false) {
  //   isNewFile = true;
  // }
  // if (isNewFile || overWrite === true) {
  const params = {
    Bucket: param.bucketName,
    Key: filePath,
    Body: content,
  };
  const request = s3.upload(params);
  if (onUploadProgress) {
    request.on("httpUploadProgress", (progress) => {
      if (onUploadProgress) {
        onUploadProgress(progress, () => request.abort());
      }
    }); // onUploadProgress as any);
  }
  if (onAbort) {
    onAbort = () => request.abort();
  }
  try {
    return request.promise();
  } catch (e) {
    console.log(e);
    return Promise.reject(e);
  }
  // } else {
  //   return Promise.reject(result);
  // }
}

async function deleteFilePromise(param) {
  return await s3
    .deleteObject({
      Bucket: param.bucketName,
      Key: param.path,
    })
    .promise();
}

async function deleteDirectoryPromise(param) {
  const prefixes = await getDirectoryPrefixes(param);
  if (prefixes.length > 0) {
    const deleteParams = {
      Bucket: param.bucketName,
      Delete: { Objects: prefixes },
    };

    try {
      return s3.deleteObjects(deleteParams).promise();
    } catch (e) {
      console.error(e);
      return Promise.resolve(e);
    }
  }
  return await s3
    .deleteObject({
      Bucket: param.bucketName,
      Key: param.path,
    })
    .promise();
}

async function getDirectoryPrefixes(param) {
  const prefixes = [];
  const promises = [];
  const listParams = {
    Bucket: param.bucketName,
    Prefix: normalizeRootPath(param.path) + "/",
    // Prefix: tsPaths.normalizePath(normalizeRootPath(param.path)) + "/",
    Delimiter: "/",
  };
  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (
    listedObjects.Contents.length > 0 ||
    listedObjects.CommonPrefixes.length > 0
  ) {
    listedObjects.Contents.forEach(({ Key }) => {
      prefixes.push({ Key });
    });

    listedObjects.CommonPrefixes.forEach(({ Prefix }) => {
      prefixes.push({ Key: Prefix });
      promises.push(getDirectoryPrefixes({ ...param, path: Prefix }));
    });
  }
  const subPrefixes = await Promise.all(promises);
  subPrefixes.map((arrPrefixes) => {
    arrPrefixes.map((prefix) => {
      prefixes.push(prefix);
    });
  });
  return prefixes;
}

module.exports = {
  uploadS3,
  saveBinaryFilePromise,
  deleteDirectoryPromise,
  deleteFilePromise,
  getDirectoryPrefixes,
};
