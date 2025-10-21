const db = require('../db/queries');

const { body, validationResult, matchedData } = require("express-validator");


// Validation

const existingCategoryErr = 'Category already exists, name must be a unique value'

//
const isUniqueCategory = async (value) => {
  const gameExists = await db.categoryExists(value);
  if(gameExists){
    throw new Error (existingGameErr);
  }
  return true;
}

const validateAddCategory = [
  body("table_name").trim()
    .custom(isUniqueGame),
  body("col_name").trim()
    .notEmpty().withMessage(genresErr)
    
];

// Route handlers

exports.categoriesIndexGet = async(req, res) => {
  const categories = await db.getAllCategories();

  res.render('pages/categoriesIndex', { 
    title: 'All Categories',
    categories
  })
}

exports.categoriesAddGet = async(req, res) => {
  res.render('pages/categoriesAdd', {
    title: 'Add'
  });
}

exports.categoriesAddPost = [
  async(req, res) => {
    console.log(req.body);
    res.send(req.body);
  }
];

exports.categoriesIdGet = async(req, res) => {
  const { id } = req.params
  const data = await db.getAllDataByTable(id);
  const categoryObj = await db.getCategoryByTableName(id);

  res.render('pages/categoriesId', {
    title: `All ${categoryObj.table_name}`,
    categoryObj,
    data,
  })
}