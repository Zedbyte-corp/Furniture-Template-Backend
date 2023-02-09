// messages handled here

const noResult = (name) => {
  return `No ${name} found`;
};
const notUpdated = (name) => {
  return `${name} not updated in document`;
};
const notDeleted = (name) => {
  return `${name} not deleted in document`;
};
const invalidCredentials = (username, password) => {
  return `please check the credentials username: ${username}, password: ${password}`;
};
const getAll = (name) => {
  return `list of all ${name} fetched successfully`;
};
const getOne = (name) => {
  return `${name} fetched successfully`;
};
const uploadImage = (error) => {
  return `${error}`;
};
const alreadyExits = (name, id) => {
  return `document with this ${name} ${id} already exits`;
};
const Unknown = "Unknown Error Found From Server Side";
const emptyDatabase = "No presence of requested document";
const imageError = "image cant be uploaded";
const notEmpty = "document is already present!";
const Insert = "document were inserted successfully";
const update = "document were updated successfully";
const Delete = "document were deleted successfully";
const login = "you have been logged in successfully";

module.exports = {
  noResult,
  notUpdated,
  notDeleted,
  invalidCredentials,
  getAll,
  getOne,
  uploadImage,
  alreadyExits,
  Unknown,
  update,
  emptyDatabase,
  Insert,
  notEmpty,
  Delete,
  imageError,
  login,
};
