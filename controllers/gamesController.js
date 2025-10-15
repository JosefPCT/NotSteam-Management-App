const db = require('../db/queries');


exports.gamesIndexGet = async(req, res) => {
  // refactor later to search for games differently if there are query parameters on the url using req.query.queryName
  const games = await db.getGames();
  console.log("Games:", games);
  res.render('pages/games', {
    title: 'Games',
    games: games
  });
}

exports.gamePageGet = async(req, res) => {
  const id = req.params.id;
  const game = await db.getRequiredGameDataById(id);
  console.log("Game:", game);
  res.end();
}