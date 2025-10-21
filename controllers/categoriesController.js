const db = require('../db/queries');

exports.categoriesIndexGet = async(req, res) => {
  const categories = await db.getAllCategories();

  res.render('pages/categoriesIndex', { 
    title: 'All Categories',
    categories
  })
}

exports.categoriesIdGet = async(req, res) => {
  const { id } = req.params
  res.send(id);
}