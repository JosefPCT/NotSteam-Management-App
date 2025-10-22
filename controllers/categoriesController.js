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

  const { categoryName } = req.params;

  const categ = await db.getCategoryByTableName(categoryName);
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

exports.indexGet = async(req, res) => {
  const categories = await db.getAllCategories();

  res.render('pages/categories/index', { 
    title: 'All Categories',
    categories
  })
}

exports.addGet = async(req, res) => {
  res.render('pages/categories/add', {
    title: 'Add',
    action: '/categories/add'
  });
}

exports.addPost = [
  validateAddCategory,
  async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).render('pages/categories/add', {
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

exports.categoryNameGet = async(req, res) => {
  const { categoryName } = req.params
  const data = await db.getAllDataByTable(categoryName);
  const categoryObj = await db.getCategoryByTableName(categoryName);

  res.render('pages/categories/categoryName', {
    title: `All ${categoryObj.table_name}`,
    categoryObj,
    data,
  })
}

exports.categoryNamePost = async(req, res) => {
  const { _method } = req.body;
  const { categoryName } = req.params;

  if( _method && _method === 'DELETE'){
    console.log("Dropping table...");
    await db.dropRelationalTable(categoryName);
    await db.dropTable(categoryName);
    await db.deleteFromCategoriesByTableName(categoryName);
  }

  res.redirect('/categories');
};

exports.categoryNameAddGet = async(req, res) => {
  const { categoryName } = req.params;
  res.render('pages/categories/categoryNameAdd', {
    title: "Add an item",
    categoryName
  })
}

exports.categoryNameAddPost = [
  validateAddItem,
  async(req, res) => {
    const { categoryName } = req.params;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).render('pages/categories/categoryNameAdd', {
        title: 'Add an item',
        categoryName,
        action: '/add',
        errors: errors.array(),
      })
    }
    const { item_name }= matchedData(req);
    const categ = await db.getCategoryByTableName(categoryName);
    await db.insertDataToTable(categ.table_name, categ.col_name, item_name);

    res.redirect(`/categories/${categoryName}`);
  }
]

exports.categoryNameEditGet = async(req, res) => {
  const { categoryName } = req.params;

  const category = await db.getCategoryByTableName(categoryName);

  res.render('pages/categories/categoryNameEdit', {
    title: 'Edit a category',
    category
  })
}

exports.categoryNameEditPost = [
  async(req, res) => {
    res.end();
  }
]

exports.categNameItemIdPost = async(req, res) => {
  const { _method } = req.body;
  const { categoryName, itemId } = req.params;

    if( _method && _method === 'DELETE'){
      console.log("Deleting data in table...");
      const categ = await db.getCategoryByTableName(categoryName);
      await db.deleteDataFromTableById(categ.table_name, categ.col_name, itemId);
  }

  res.redirect(`/categories/${categoryName}`);
}