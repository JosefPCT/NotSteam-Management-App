const db = require('../db/queries');


exports.getHomepage = async(req, res) => {
  console.log(process.env);
  const test = await db.getGames();
  console.log("Test", test);
  res.render('pages/index', {
    title: 'Homepage'
  });
}