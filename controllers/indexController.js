exports.getHomepage = (req, res) => {
  res.render('pages/index', {
    title: 'Homepage'
  });
}