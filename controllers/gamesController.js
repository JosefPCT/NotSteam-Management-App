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
  const genres = await db.getAllDataByTable('genres');
  const developers = await db.getAllDataByTable('developers');

  res.render('pages/addGame', {
    title: 'Add a game',
    genres: genres,
    developers: developers
  });
}

exports.addGamePost = async(req, res) => {
  let game_id = await db.insertGame(req.body.game_name);
  game_id = game_id[0].game_id
  // console.log("showing game_id");
  // console.log(game_id);
  // res.send(req.body.genres.length);
  // console.log(Object.keys(req.body));
  Object.keys(req.body).forEach((key) => {
    if(key !== 'game_name'){
      if(Array.isArray(req.body[key])){
        console.log('an array');
        req.body[key].forEach((item_id) => {
          console.log('item', item_id);
          db.insertRelationByTable(game_id, item_id, key);
        });
      } else {
        console.log("not an array", req.body[key]);
        console.log(key);
        db.insertRelationByTable(game_id, req.body[key], key);
      }
    }
  });

  res.redirect('/games');
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