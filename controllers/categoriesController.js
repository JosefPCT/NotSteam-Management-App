const db = require('../db/queries');

const { body, validationResult, matchedData } = require("express-validator");


// Validation

const existingCategoryErr = 'Category already exists, category must be a unique value'
const existingDataErr = 'Item already exists in the table, item must be a unique value';
const sameCategoryErr = `You didn't change anything`;
const notEmptyErr = "must not be empty";

// Custom validators

// Custom validator to check if a category already exists in the 'categories' table
const isUniqueCategory = async (value) => {
  const gameExists = await db.categoryExists(value);
  if(gameExists){
    throw new Error (existingCategoryErr);
  }
  return true;
}

// Custom validator, checks that when editing a category, the value is not the same as the previous one then checks if the category already exists in the 'categories' table
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

// Custom validator, checks if data already exists in a category
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

// Custom validator, checks that when editing an item in a category, that its not the same value as the previous one, then checks if the new value already exist in the category
const isNotSameAndUniqueDataInTable = async(value, { req }) => {
  const { categoryName, itemId } = req.params;

  const category = await db.getCategoryByTableName(categoryName);
  const item = await db.getItemDataByTableAndId(category.table_name, category.col_name, itemId);
  const col_name = `${category.col_name}_name`;

  if(value !== item[col_name]){
    if(await db.dataExistsInTable(category.table_name, category.col_name, value)){
      throw new Error(existingDataErr);
    }
  }
  return true;
}


// Validation Middlewares for adding
const validateAddCategory = [
  body("table_name").trim()
    .notEmpty().withMessage(`Category Name(Plural) ${notEmptyErr}`)
    .matches(/^[a-z0-9_]+$/).withMessage("Category Name(Plural) only allows lowercase letters, numbers and undescores")
    .custom(isUniqueCategory),
  body("col_name").trim()
    .notEmpty().withMessage(`Category Name(Singular) ${notEmptyErr}`)
    .matches(/^[a-z0-9_]+$/).withMessage("Category Name(Singular) only allows lowercase letters, numbers and underscores")
    
];

const validateAddItem = [
  body("item_name").trim()
    .custom(isUniqueDataInTable)
]

// Validate middleware for editing
const validateEditCategory = [
  body("table_name").trim()
    .notEmpty().withMessage(`Category Name(Plural) ${notEmptyErr}`)
    .custom(isNotSameAndUniqueCategory),
  body("col_name").trim()
    .notEmpty().withMessage(`Category Name(Singular) ${notEmptyErr}`)
]

const validateEditItem = [
  body("item_name").trim()
    .custom(isNotSameAndUniqueDataInTable)
]

// Route handlers

// GET handler for route '/categories'
// Displays all available categories
exports.indexGet = async(req, res) => {
  const categories = await db.getAllCategories();

  res.render('pages/categories/index', { 
    title: 'All Categories',
    categories
  })
}

// GET handler for route '/categories/add'
// Renders a view that shows a form to add a category
exports.addGet = async(req, res) => {
  res.render('pages/categories/add', {
    title: 'Add',
    action: '/categories/add'
  });
}

// POST handler for route '/categories/add'
// Uses a validation middleware, checks if there are errors in validation. If there is, re-render the form view. If not, proceeds on adding the new category in the db
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

// GET route handler for 'categories/:categoryName'
// Gets ands shows all data from the certain category
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

// POST route handler for 'categories/:categoryName'
// For deleting an item
// MIGHT NEED TO REFACTOR to route into 'categories/:categoryName/delete' instead
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

// GET route handler for '/categories/:categoryName/add
// Renders a view to a form for adding an item to a category
exports.categoryNameAddGet = async(req, res) => {
  const { categoryName } = req.params;
  res.render('pages/categories/categoryNameAdd', {
    title: "Add an item",
    categoryName,
    action: `/categories/${categoryName}/add`
  })
}

// POST route handler for '/categories/:categoryName/add
// Uses a validation middleware
// Checks if there are errors in validation. If there is re-renders the form view for adding an item. If not, proceeds to inserting the item to the appropriate table
exports.categoryNameAddPost = [
  validateAddItem,
  async(req, res) => {
    const { categoryName } = req.params;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).render('pages/categories/categoryNameAdd', {
        title: 'Add an item',
        categoryName,
        action: `/categories/${categoryName}/add`,
        errors: errors.array(),
      })
    }
    const { item_name }= matchedData(req);
    const categ = await db.getCategoryByTableName(categoryName);
    await db.insertDataToTable(categ.table_name, categ.col_name, item_name);

    res.redirect(`/categories/${categoryName}`);
  }
]

// GET route handler for '/categories/:categoryName/edit
// Renders a view of a form to edit a category name
// Already prepends the value to the form of the current name of the category by passing 'myCategory' object that has the current data
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

// POST route handler for '/categories/:categoryName/edit'
// Uses a validation middleware
// Checks if there are errors in validation. If there is, re-renders the view like its GET route handler, which means also getting the current data
// If no errors, proceeds on renaming and updating the category name
// Uses a lot of queries in altering and renaming db tables, and updating data on the 'categories' table
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

// POST route handler for '/categories/:categoryName/:itemId'
// Mostly for using the delete button in `/categories/:categoryName/' view/page
// Deletes an item in the category/table
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

// GET route handler for '/categories/:categoryName/:itemId/edit'
// Used for editing an item in the category/table
// Gets and shows all current data for the specific item in the table
// Renders a view that has a form for editing the item's data (name)
exports.categNameItemIdEditGet = async(req, res) => {
  const { categoryName, itemId } = req.params;

  const myCategory = await db.getCategoryByTableName(categoryName);
  const myItem = await db.getItemDataByTableAndId(myCategory.table_name, myCategory.col_name, itemId);
  console.log(myCategory);
  console.log(myItem);
  res.render('pages/categories/categoryNameItemIdEdit', {
    title: 'Edit an item',
    categoryName,
    itemId,
    action: `/categories/${categoryName}/${itemId}/edit`,
    myCategory,
    myItem,
  })
}

// POST route handler for '/categories/:categoryName/:itemId/edit'
// Uses a validation middleware
// Checks if there is errors in validation. If there is, re-renders the view with the form for editing, just like its GET handler, gets and shows all current data for the specifc item
// If not, proceeds to updating the item's data (name), on the appropriate table/category
exports.categNameItemIdEditPost = [
  validateEditItem,
  async(req, res) => {
  const { categoryName, itemId } = req.params;
  const myCategory = await db.getCategoryByTableName(categoryName);
  const myItem = await db.getItemDataByTableAndId(myCategory.table_name, myCategory.col_name, itemId);
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).render('pages/categories/categoryNameItemIdEdit', {
      title: 'Edit an item',
      categoryName,
      itemId,
      myCategory,
      myItem,
      action: `/categories/${categoryName}/${itemId}/edit`,
      errors: errors.array(),
    })
  }

  const { item_name } = matchedData(req);

  await db.updateItemDataByTableAndId(myCategory.table_name, myCategory.col_name, itemId, item_name);
  res.redirect(`/categories/${categoryName}`);
  }
];