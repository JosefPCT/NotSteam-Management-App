const db = require('../db/queries');

exports.categoriesIndexGet = async(req, res) => {
  const categories = await db.getAllCategories();

  res.render('pages/categoriesIndex', { 
    title: 'All Categories',
    categories
  })
}

exports.categoriesAddGet = async(req, res) => {
  res.send('Adding category');
}

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