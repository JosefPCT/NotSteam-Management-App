const { body, validationResult, matchedData } = require("express-validator");

const db = require('../db/queries');
const helpers = require('./helpers.js');

// Validation

const gameNameEmptyErr = "must have a game name";
const genresErr = "must have at least 1 genre";
const genresLengthErr = 'must have at least 1 genre and no more than 3 genres';
const existingGameErr = 'Game already exists, name must be a unique value'

// Can disable code since game name doesn't have to be unique
// A custom validator to check if a game already exists in the 'games' table
const isUniqueGame = async (value) => {
  const gameExists = await db.checkGameExists(value);
  if(gameExists){
    throw new Error (existingGameErr);
  }
  return true;
}

// Custom validator used in editing a game, checks if the previous value is not the same as the new one when submitting the edit, and if not, checks if the game already exists in the 'games' table
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

// Validator Middlewares
// Pass on to a route middleware as the first argument

const validateAddGame = [
  body("game_name").trim()
    .notEmpty().withMessage(gameNameEmptyErr)
    .custom(isUniqueGame),
  body("genres").trim()
    .notEmpty().withMessage(genresErr)
    .isArray( {min: 1, max: 3}).withMessage(genresLengthErr)

];

const validateEditGame = [
  body("game_name").trim()
    .custom(isNotSameNameAndUniqueName),
  body("genres").trim()
    .notEmpty().withMessage(genresErr)
]



// Route handlers

// Handler for the route '/games'
// Checks if a query string is present. If present, will show games based on the value of the query string. If not, will show all games
// Mutates an object to get all available data for each game, to pass on to the view
exports.gamesIndexGet = async(req, res) => {
  // refactor later to search for games differently if there are query parameters on the url using req.query.queryName
  const categories = await db.getAllCategories();

  const { category, searchString } = req.query; 

  let query = [];
  let games;

  if(category && searchString){
    // console.log('has a category', category);
    // console.log('has a searchString', searchString);
    query.push({ category : category , searchString: searchString});
    
    if(category === 'games'){
      games = await db.searchGameByName(searchString);
    } else {
      games = await db.getGamesByTable(category, searchString);
    }
  } else {
    games = await db.getGames();
  }
  

  // Mutating 'games' object, iterating through 'games' and iterating through 'categories' object to get data for each game
  for (const [ind, game] of games.entries()){
    // console.log("Iterating through games object using for...of");
    // console.log(game);
    // console.log(ind)
    games[ind].categories = [];
    for (const [ind2, category] of categories.entries()){
      // console.log("Iterating through categories/tables");
      // console.log('Showing game', game);

      let data = await db.getRelationalDataByTableAndId(category.table_name, category.col_name, game.game_id);
      let catName = 'categories';
      games[ind][catName].push({ table_name: category.table_name, col_name: category.col_name, data });
    }

    // Test code to get structure of object
    // console.log("Showing game object")
    // console.log(game);
    // console.log("Showing game object's categories");
    // console.log(game.categories);
    // for (const [ind, category] of game.categories.entries()){
    //   console.log("showing current category data", category.data);
    //   console.log("length", category.data.length);
    //  category.data.forEach((item) => {
    //   // console.log('showing current item', item);
    //   // console.log('showing current',category.data)
    //   if(category){
    //     console.log('has object')
    //   } else {
    //     console.log('has not object');
    //   }
    //  })
    // }
  }

  // Test code to figure out how to declare objects through bracket notation
  // console.log(games);
  // let testProp = categories[0].table_name;
  // games[0][testProp] = 'test prop';
  // console.log("First game", games[0]);
  // console.log("Games:", games);


  res.render('pages/indexGames', {
    title: 'Games',
    categories,
    games: games,
    query
  });
}


// GET Handler for route '/games/add'
// Search and get all available categories and their data
// Creates a dynamic form based on available categories and data
exports.gamesAddGet = async(req, res) => {
  const allCategories = await db.getAllCategories();

  for(const [ind, category] of allCategories.entries()){
    let data = await db.getAllDataByTable(category.table_name);
    category.data = data;
  }

  res.render('pages/gamesAdd', {
    title: 'Add a game',
    allCategories,
    action: '/games/add',
    capitalize: helpers.capitalizeFirstLetter
  });
}

// POST handler route for '/games/add'
// Uses a validation middleware by making the handler an array, and passing the validation middleware as the first item
// Checks if theres an error in the validation. 
// If there is, re-render the page and pass on an errors object to the view
// If not, proceed with the logic and database queries to insert the new game and its data to their respective tables
exports.gamesAddPost = [ 
  validateAddGame,
  async(req, res) => {
    console.log("Checking req body", req.body);
    const errors = validationResult(req);
    const allCategories = await db.getAllCategories();

    for(const category of allCategories){
      let data = await db.getAllDataByTable(category.table_name);
      category.data = data;
    }

    if(!errors.isEmpty()){
      return res.status(400).render('pages/gamesAdd', {
        title: 'Add a game',
        allCategories,
        action: '/games/add',
        errors: errors.array(),
        capitalize: helpers.capitalizeFirstLetter
      })
    }

    const { game_name } = req.body;

    let game_id = await db.insertGame(game_name);
    game_id = game_id[0].game_id;

    for(const key in req.body){
      console.log("Iterating through req.body with for...in");
      console.log(`Key: ${key}, Value: ${req.body[key]}`);
      if(key !== 'game_name'){
        if(Array.isArray(req.body[key])){
          for(const itemId of req.body[key]){
            console.log("Item id", itemId);
            await db.insertRelationByTable(game_id, itemId, key);
          }
        } else {
          await db.insertRelationByTable(game_id, req.body[key], key);
        }
      }
    }

    res.redirect('/games');
  }
];

// GET route handler for 'games/:id'
// Creates a page based on ':id' from req.params
// Show data relevant to the specific game
exports.gamesIdGet = async(req, res) => {
  const { id } = req.params;

  const myGame = await db.getGameById(id);
  myGame.categories = [];

  const categories = await db.getAllCategories();
  
  for(const category of categories){
    console.log(category);
    let data = await db.getRelationalDataByTableAndId(category.table_name, category.col_name, myGame.game_id);
    console.log(data);
    myGame.categories.push( {table_name: category.table_name, col_name: category.col_name, data} );
  }

  res.render('pages/gamesId', {
    title: 'Game',
    myGame,
    capitalize: helpers.capitalizeFirstLetter
  });
}

// POST route handler for 'games/:id'
// Checks if the method from the hidden input is _DELETE, and proceeds on deleting the specific game if it is
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

// GET route handler for '/games/:id/edit
// To Refactor:

// Gets all available data from categories/tables,  similar to gamesAddGet and gamesAddPost, to create a dynamic form
// Gets data from the specific game (/:id), to prepend values for user if there is data

exports.gamesIdEditGet = async(req, res) => {
  const { id } = req.params;

  let myData = {};
  const game = await db.getGameById(id);
  myData.game = game;
  myData.categories = {};
  const allCategories = await db.getAllCategories();

  for(const [ind, category] of allCategories.entries()){
    let data = await db.getAllDataByTable(category.table_name);
    category.data = data;

    relatedData = await db.getRelationalDataByTableAndId(category.table_name, category.col_name, myData.game.game_id);
    myData.categories[category.table_name] = {}
    myData.categories[category.table_name]['ids'] = [];
    relatedData.forEach((data) => {
      myData.categories[category.table_name].ids.push(data[`${category.col_name}_id`]);
    });
  }

  // console.log('my data', myData);
  // console.log(myData.categories.genres.ids);

  res.render('pages/gamesIdEdit', {
    title: 'Edit Game',
    allCategories,
    myData,
    action: '/games/' + myData.game.game_id + '/edit',
    capitalize: helpers.capitalizeFirstLetter
  });
}

// POST route handler for '/games/:id/edit
// To Refactor:

// Goes through a validation middleware first
// Checks if there is an error in validation
// If there is, Same as its GET handler, gets all available data on each categories, and data specific to the game, and re-renders the view
// If not, proceeds on editing data with database queries, then redirects 
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
        myGame: game,
        allGenres,
        myGenresId,
        allDevelopers,
        myDeveloper: myDeveloper[0],
        action: '/games/' + game.game_id + '/edit',
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

  // Old code on performing a search query on `gamesIndexGet`
  // console.log(Object.keys(req.query).length);
  // console.log(Object.values(req.query)[0]);

  // if(Object.keys(req.query)[0] === 'games'){
  //   games = await db.searchGameByName(Object.values(req.query)[0]);
  // } else if(Object.keys(req.query).length !== 0){
  //   games = await db.getGamesByTable(Object.keys(req.query)[0], Object.values(req.query)[0]);
  // } else {
  //   games = await db.getGames();
  // }