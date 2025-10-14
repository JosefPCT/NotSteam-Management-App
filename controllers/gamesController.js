const db = require('../db/queries');


exports.gamesIndexGet = async(req, res) => {
  const games = await db.getGames();
  console.log("Games:", games);
  res.render('pages/games', {
    title: 'Games',
    games: games
  });
}

exports.gamePageGet = async(req, res) => {
  const id = req.params.id;
  const game = await db.getGameById(id);
  console.log("Game:", game);
  res.end();
}