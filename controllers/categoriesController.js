const db = require('../db/queries');

const { body, validationResult, matchedData } = require("express-validator");


// Validation

const existingCategoryErr = 'Category already exists, category must be a unique value'
const sameCategoryErr = `You didn't change anything`;
const existingDataErr = 'Data already exists';
const notEmptyErr = "must not be empty";

// Custom validators
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

const isNotSameAndUniqueCategory = async(value, { req }) => {
  console.log("Custom validator for checking when editing a category, must not be the same category and new category must not exists in the 'categories' table ");
  
  const { categoryName } = req.params;

  if(value !== categoryName){
    if(await db.categoryExists(value)){
      throw new Error(existingCategoryErr);
    }
  } 
  // else {
  //   throw new Error(sameCategoryErr);
  // }

  return true;
}


// Validate data
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

// Validate editing

const validateEditCategory = [
  body("table_name").trim()
    .notEmpty().withMessage(`Category Name(Plural) ${notEmptyErr}`)
    .custom(isNotSameAndUniqueCategory),
  body("col_name").trim()
    .notEmpty().withMessage(`Category Name(Singular) ${notEmptyErr}`)
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

  const myCategory = await db.getCategoryByTableName(categoryName);

  res.render('pages/categories/categoryNameEdit', {
    title: 'Edit a category',
    categoryName,
    myCategory,
    action: `/categories/${categoryName}/edit`
  })
}

exports.categoryNameEditPost = [
  validateEditCategory,
  async(req, res) => {
    const { categoryName } = req.params;
    const myCategory = await db.getCategoryByTableName(categoryName);
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(400).render('pages/categories/categoryNameEdit', {
        title: 'Edit a category',
        categoryName,
        myCategory,
        action: `/categories/${categoryName}/edit`,
        errors: errors.array(),
      })
    }
    // Use `myCategory` for old table name and column name
    const { table_name, col_name } = matchedData(req);

    await db.renameTable(myCategory.table_name, table_name);
    await db.renameRelationalTable(myCategory.table_name, table_name);
    await db.renameSequenceTable(myCategory.table_name, table_name, myCategory.col_name, col_name);
    await db.renameIdColumn(table_name, myCategory.col_name, col_name);
    await db.renameNameColumn(table_name, myCategory.col_name, col_name);
    await db.renameRelationalIdColumn(table_name, myCategory.col_name, col_name);
    await db.updateCategories(table_name, myCategory.table_name, col_name);
    
    res.redirect('/categories');
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

exports.categNameItemIdEditGet = async(req, res) => {
  const { categoryName, itemId } = req.params;
  console.log(categoryName);
  console.log(itemId);
  res.send('Edit Item');
}