const db = require('../db/queries');


exports.gamesPageGet = async(req, res) => {
  const games = await db.getGames();
  console.log("Games:", games);
  res.render('pages/games', {
    title: 'Games',
    games: games
  });
}