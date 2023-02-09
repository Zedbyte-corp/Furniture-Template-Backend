// this page helps us to list specific fields from the document

const productFields = {
  productId: 1,
  productName: 1,
  productImage: 1,
  productDescription: 1,
  productCategoryId: 1,
  productSubcategoryId: 1,
};

const categoryFields = {
  categoryId: 1,
  categoryName: 1,
  categoryImage: 1,
  categoryDescription: 1,
  subcategory: 1,
};

const SubCategoryFields = {
  subcategory: 1,
};

module.exports = {
  productFields,
  categoryFields,
  SubCategoryFields,
};
