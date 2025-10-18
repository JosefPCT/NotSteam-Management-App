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
  const allGenres = await db.getAllDataByTable('genres');
  const allDevelopers = await db.getAllDataByTable('developers');

  res.render('pages/gamesAdd', {
    title: 'Add a game',
    allGenres,
    allDevelopers,
    action: '/games/add'
  });
}

exports.gamesAddPost = async(req, res) => {
  let game_id = await db.insertGame(req.body.game_name);
  game_id = game_id[0].game_id;

  Object.keys(req.body).forEach(async (key) => {
    if(key !== 'game_name'){
      if(Array.isArray(req.body[key])){
        console.log('an array');
        req.body[key].forEach(async (item_id) => {
          console.log('item', item_id);
          await db.insertRelationByTable(game_id, item_id, key);
        });
      } else {
        console.log("not an array", req.body[key]);
        console.log(key);
        await db.insertRelationByTable(game_id, req.body[key], key);
      }
    }
  });

  res.redirect('/games');
}

exports.gamesIdGet = async(req, res) => {
  const id = req.params.id;
  const myGame = await db.getGameById(id);
  const myGenres = await db.getGameGenresById(id);
  const myDeveloper = await db.getGameDeveloperById(id);

  console.log('My genres', myGenres);

  res.render('pages/gamesId', {
    title: 'Game',
    myGame: myGame[0],
    myGenres,
    myDeveloper: myDeveloper[0]
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
  const game = await db.getGameById(id);
  const myGenresRows = await db.getGameGenresById(id);
  let myGenresId = [];
  myGenresRows.forEach((row) => {
    myGenresId.push(row.genre_id);
  })
  const myDeveloper = await db.getGameDeveloperById(id);

  // console.log(game[0]);
  // console.log(genresId.includes(2));
  // console.log(Object.values(genres));
  console.log(myDeveloper[0]);

  console.log(allGenres);
  // console.log(allDevelopers);


  res.render('pages/gamesIdEdit', {
    title: 'Edit Page',
    myGame: game[0],
    allGenres: allGenres,
    myGenresId: myGenresId,
    allDevelopers: allDevelopers,
    myDeveloper: myDeveloper[0],
    action: '/games/' + game[0].game_id + '/edit'
  });
}

exports.gamesIdEditPost = async(req, res) => {
  console.log("'games/:id/edit' POST route...");
  console.log(req.body);
  
  const prevGame = await db.getGameById(req.params.id);

  let game_id = prevGame[0].game_id;

  // Check if game name is the same as the updated one, update if not
  if(!(prevGame[0].game_name === req.body.game_name)){
    console.log("Update new name");
    await db.updateGame(req.body.game_name, req.params.id);
  }

  // Delete all genres for this specific game
  await db.deleteAllGenresOfGameById(game_id);

  // Inserts relational table data
  Object.keys(req.body).forEach(async (key) => {
    if(key !== 'game_name'){
      if(Array.isArray(req.body[key])){
        console.log('an array');
        req.body[key].forEach(async (item_id) => {
          console.log('item', item_id);
          await db.insertRelationByTable(game_id, item_id, key);
        });
      } else {
        console.log("not an array", req.body[key]);
        console.log(key);
        await db.insertRelationByTable(game_id, req.body[key], key);
      }
    }
  });

  res.redirect('/games/' + req.params.id);
}