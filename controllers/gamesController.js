const db = require('../db/queries');


exports.gamesIndexGet = async(req, res) => {
  // refactor later to search for games differently if there are query parameters on the url using req.query.queryName
  const games = await db.getGames();
  console.log("Games:", games);
  res.render('pages/indexGames', {
    title: 'Games',
    games: games
  });
}

exports.addGameGet = async(req, res) => {
  const genres = await db.getAllGameGenres();

  res.render('pages/addGame', {
    title: 'Add a game',
    genres: genres
  });
}

exports.addGamePost = async(req, res) => {
  res.send('add game post');
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

  // console.log(game_name);
  console.log("Game:", game_genres);
  // if(game_name.length){
  //   console.log('Found');
  // }

  const game = {
    game: game_name[0],
    genres: game_genres,
    developer: developer[0]
  }
  console.log(game);



  res.render('pages/gamesId', {
    title: 'Game',
    game: game
  });
}