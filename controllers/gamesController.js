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

exports.gamesAddGet = async(req, res) => {
  const genres = await db.getAllDataByTable('genres');
  const developers = await db.getAllDataByTable('developers');

  res.render('pages/addGame', {
    title: 'Add a game',
    genres: genres,
    developers: developers
  });
}

exports.gamesAddPost = async(req, res) => {
  let game_id = await db.insertGame(req.body.game_name);
  game_id = game_id[0].game_id;

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

exports.gamesIdGet = async(req, res) => {
  const id = req.params.id;
  const game_name = await db.getGameById(id);
  const game_genres = await db.getGameGenresById(id);
  const developer = await db.getGameDeveloperById(id);

  const game = {
    game: game_name[0],
    genres: game_genres,
    developer: developer[0]
  }

  res.render('pages/gamesId', {
    title: 'Game',
    game: game
  });
}

exports.gamesIdPost = async(req, res) => {
  console.log("Post Route");
  if(req.body._method === 'DELETE'){
    console.log("Deleting...");
    const id = req.params.id;
    db.deleteGameById(id);
  
  }
  res.redirect('/games');
}

exports.gamesIdEditGet = async(req, res) => {
  const allGenres = await db.getAllDataByTable('genres');
  const allDevelopers = await db.getAllDataByTable('developers');

  const id = req.params.id;
  const game= await db.getGameById(id);
  const genres = await db.getGameGenresById(id);
  const developer = await db.getGameDeveloperById(id);

  

  res.send('Edit Page');
}