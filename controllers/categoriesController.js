const db = require('../db/queries');

const { body, validationResult, matchedData } = require("express-validator");


// Validation

const existingCategoryErr = 'Category already exists, name must be a unique value'
const notEmptyErr = "must not be empty";

//
const isUniqueCategory = async (value) => {
  const gameExists = await db.categoryExists(value);
  if(gameExists){
    throw new Error (existingCategoryErr);
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
    const { table_name, col_name }= req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).render('pages/categoriesAdd', {
        title: 'Add',
        action: '/add',
        errors: errors.array(),
      })
    }
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
