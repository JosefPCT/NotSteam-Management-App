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
  // const game = await db.getRequiredGameDataById(id);
  const game_name = await db.getGameNameById(id);
  const game_genres = await db.getGameGenresById(id);
  // game_genres.forEach((genre) => {
  //   console.log(genre.genre_name);
  // })
  const developer = await db.getGameDeveloperById(id);

  console.log(game_genres);
  // if(game_name.length){
  //   console.log('Found');
  // }
  console.log("Game:", game_genres);
  res.end();
}