const { body, validationResult, matchedData } = require("express-validator");

const db = require('../db/queries');

// Validation

const testErr = "test error";
const genresErr = "must have at least 1 genre";
const existingGameErr = 'Game already exists, name must be a unique value'

// Can disable code since game name doesn't have to be unique
const isUniqueGame = async (value) => {
  const gameExists = await db.checkGameExists(value);
  if(gameExists){
    throw new Error (existingGameErr);
  }
  return true;
}

const isNotSameNameAndUniqueName = (async(value, { req }) => {
  // console.log("inside validator custom");
  // console.log("reqbody", req.body);
  // console.log("reqparams", req.params);
  // console.log("value", value);

  const { id } = req.params;
  const prevGameName = await db.getGameNameById(id);

  if(prevGameName !== value){
    const gameExists = await db.checkGameExists(value);
    if(gameExists){
      throw new Error(existingGameErr);
    }
  }
  return true;
})

const validateAddGame = [
  body("game_name").trim()
    .custom(isUniqueGame),
  body("genres").trim()
    .notEmpty().withMessage(genresErr)
    
];

const validateEditGame = [
  body("game_name").trim()
    .custom(isNotSameNameAndUniqueName),
  body("genres").trim()
    .notEmpty().withMessage(genresErr)
]



// Route handlers
exports.gamesIndexGet = async(req, res) => {
  // refactor later to search for games differently if there are query parameters on the url using req.query.queryName
  const { genres } = req.query;
  
  console.log(Object.keys(req.query).length);
  console.log(Object.values(req.query)[0]);

  let games;

  if(Object.keys(req.query)[0] === 'games'){
    games = await db.searchGameByName(Object.values(req.query)[0]);
  } else if(Object.keys(req.query).length !== 0){
    games = await db.getGamesByTable(Object.keys(req.query)[0], Object.values(req.query)[0]);
  } else {
    games = await db.getGames();
  }

  // if(genres){
  //   // games = await db.getGamesByGenre(genres);
  //   games = await db.getGamesByTable('genres', genres);
  // } else {
  //   games = await db.getGames();
  // }


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

exports.gamesAddPost = [ 
  validateAddGame,
  async(req, res) => {
    console.log("Checking req body", req.body);
    const errors = validationResult(req);
    const allGenres = await db.getAllDataByTable('genres');
    const allDevelopers = await db.getAllDataByTable('developers');

    if(!errors.isEmpty()){
      return res.status(400).render('pages/gamesAdd', {
        title: 'Add a game',
        allGenres,
        allDevelopers,
        action: '/games/add',
        errors: errors.array(),
      })
    }
    const { game_name } = req.body;

    let game_id = await db.insertGame(game_name);
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
];

exports.gamesIdGet = async(req, res) => {
  const { id } = req.params;

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
  const { _method } = req.body;
  const { id } = req.params;

  if(_method === 'DELETE'){
    console.log("Deleting...");
    db.deleteGameById(id);
  
  }
  res.redirect('/games');
}

exports.gamesIdEditGet = async(req, res) => {
  const { id } = req.params;

  const allGenres = await db.getAllDataByTable('genres');
  const allDevelopers = await db.getAllDataByTable('developers');

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
    title: 'Edit Game',
    myGame: game[0],
    allGenres: allGenres,
    myGenresId: myGenresId,
    allDevelopers: allDevelopers,
    myDeveloper: myDeveloper[0],
    action: '/games/' + game[0].game_id + '/edit'
  });
}

exports.gamesIdEditPost = [
  validateEditGame,
  async(req, res) => {
    console.log("'games/:id/edit' POST route...");
    console.log('request body', req.body);
    
    const { id } = req.params
    const { game_name } = req.body;

    const errors = validationResult(req);
    const allGenres = await db.getAllDataByTable('genres');
    const allDevelopers = await db.getAllDataByTable('developers');

    const game = await db.getGameById(id);
    const myGenresRows = await db.getGameGenresById(id);
    let myGenresId = [];
    myGenresRows.forEach((row) => {
      myGenresId.push(row.genre_id);
    })
    const myDeveloper = await db.getGameDeveloperById(id);

    if(!errors.isEmpty()){
      return res.status(400).render('pages/gamesIdEdit', {
        title: 'Edit Game',
        myGame: game[0],
        allGenres,
        myGenresId,
        allDevelopers,
        myDeveloper: myDeveloper[0],
        action: '/games/' + game[0].game_id + '/edit',
        errors: errors.array(),
      })
    }

    // If no errors, proceed on updating
    const prevGame = await db.getGameById(id);
    let game_id = prevGame[0].game_id;

    // Check if game name is the same as the updated one, update if not
    if(!(prevGame[0].game_name === game_name)){
      console.log("Update new name");
      await db.updateGame(game_name, id);
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
          await db.updateRelationByTable(game_id, req.body[key], key);
        }
      }
    });

    res.redirect('/games/' + id);
  }
]