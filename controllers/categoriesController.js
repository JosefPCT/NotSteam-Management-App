const db = require('../db/queries');

const { body, validationResult, matchedData } = require("express-validator");


// Validation

const existingCategoryErr = 'Category already exists, category must be a unique value'
const existingDataErr = 'Data already exists';
const notEmptyErr = "must not be empty";

//
const isUniqueCategory = async (value) => {
  const gameExists = await db.categoryExists(value);
  if(gameExists){
    throw new Error (existingCategoryErr);
  }
  return true;
}

const isUniqueDataInTable = async(value, { req }) => {
  console.log("Custom validator unique data in table");
  console.log("Check for req.params", req.params);

  const { id } = req.params;

  const categ = await db.getCategoryByTableName(id);
  console.log(categ);

  if(await db.dataExistsInTable(categ.table_name, categ.col_name, value)){
    throw new Error (existingDataErr);
  }
  return true;
}

const validateAddCategory = [
  body("table_name").trim()
    .notEmpty().withMessage(`Category Name(Plural) ${notEmptyErr}`)
    .custom(isUniqueCategory),
  body("col_name").trim()
    .notEmpty().withMessage(`Category Name(Singular) ${notEmptyErr}`)
    
];

const validateAddItem = [
  body("item_name").trim()
    .custom(isUniqueDataInTable)
]

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
  validateAddCategory,
  async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).render('pages/categoriesAdd', {
        title: 'Add',
        action: '/add',
        errors: errors.array(),
      })
    }
    const { table_name, col_name }= matchedData(req);

    if(table_name && col_name){
      await db.createTable(table_name, col_name);
      await db.createRelationalTable(table_name,col_name);
      await db.insertToCategories(table_name, col_name);
    }

    res.redirect('/categories');
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

exports.categoriesIdPost = async(req, res) => {
  const { _method } = req.body;
  const { id } = req.params;
  console.log(id);

  if( _method && _method === 'DELETE'){
    console.log("Dropping table...");
    await db.dropRelationalTable(id);
    await db.dropTable(id);
    await db.deleteFromCategoriesByTableName(id);
  }

  res.redirect('/categories');
};

exports.categoriesIdAddGet = async(req, res) => {
  const { id } = req.params;
  res.render('pages/categoriesIdAdd', {
    title: "Add an item",
    id
  })
}

exports.categoriesIdAddPost = [
  validateAddItem,
  async(req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).render('pages/categoriesIdAdd', {
        title: 'Add an item',
        id,
        action: '/add',
        errors: errors.array(),
      })
    }
    const { item_name }= matchedData(req);
    const categ = await db.getCategoryByTableName(id);
    await db.insertDataToTable(categ.table_name, categ.col_name, item_name);

    res.redirect(`/categories/${id}`);
  }
]