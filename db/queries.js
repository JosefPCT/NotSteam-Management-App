const pool = require('./pool');

// SELECTING

async function getAllDataByTable(table){
  const sql = `
    SELECT * 
    FROM ` + table + `;`;

  const { rows } = await pool.query(sql);
  return rows;
}

async function getGames(){
  const { rows } =  await pool.query(`SELECT * FROM games;`);
  return rows;
}

async function getGameById(id){
 const sql = `
   SELECT game_id, game_name 
   FROM games
   WHERE game_id=$1;
 `;

 const { rows } = await pool.query(sql, [id]);
 return rows;
}

async function getGameGenresById(id){
 const sql = `
   SELECT ge.genre_id, ge.genre_name
   FROM games ga
   JOIN games_genres gg ON ga.game_id = gg.game_id
   JOIN genres ge ON ge.genre_id = gg.genre_id
   WHERE ga.game_id=$1;
 `;
  const { rows } = await pool.query(sql,[id]);
  return rows;
}

async function getGameDeveloperById(id){
 const sql = `
   SELECT d.developer_id, d.developer_name
   FROM games ga
   JOIN games_developers gd ON ga.game_id = gd.game_id
   JOIN developers d ON d.developer_id = gd.developer_id
   WHERE ga.game_id=$1;
 `;
  const { rows } = await pool.query(sql,[id]);
  return rows;
}

// Inserting

async function insertGame(data){
  const sql = `
  INSERT INTO games(game_name) VALUES
  ($1)
  RETURNING game_id;
  `;

  const { rows } = await pool.query(sql, [data]);
  // console.log('Inserted row:', rows);
  return rows;
}

async function insertRelationByTable(game_id, data_id, table){
  // Alternative: Query to categories table to get column name of the table, might need to create a category table
  let col_name = table.slice(0, -1);
  const sql = `INSERT INTO games_` + table + `(game_id,` + col_name + `_id) VALUES ($1,$2);`;
  await pool.query(sql, [game_id,data_id]);
}

// Updating

async function updateGame(newData,game_id){
  const sql = `
  UPDATE games
  SET game_name = $1
  WHERE game_id = $2;
  `;
  await pool.query(sql, [newData,game_id]);
}

// Deleting
async function deleteGameById(id){
  const sql = `
    DELETE FROM games
    WHERE game_id=$1;
  `;
  await pool.query(sql, [id]);
}

module.exports = {
  getAllDataByTable,
  getGames,
  getGameById,
  getGameGenresById,
  getGameDeveloperById,
  insertGame,
  insertRelationByTable,
  updateGame,
  deleteGameById,
}

// Unused

// async function getRequiredGameDataById(id){
//   const sql = `
//   SELECT ga.game_name, ge.genre_name, d.developer_name
//   FROM games ga
//   JOIN games_genres gg ON ga.game_id = gg.game_id
//   JOIN genres ge ON ge.genre_id = gg.genre_id
//   JOIN games_developers gd ON ga.game_id = gd.game_id
//   JOIN developers d ON d.developer_id = gd.developer_id
//   WHERE ga.game_id=$1;
//   `;

//   const { rows } = await pool.query(sql,[id]);
//   return rows;
// }

// // Refactor to use a query to JOIN other tables for complete information on the game including genres and developers, and other categories it may have
// async function getGameById(id){
//   const sql = `SELECT * FROM games WHERE game_id=$1;`
//   const { rows } = await pool.query(sql,[id]);
//   return rows;
// }


// Old Function
// Refactored function of getGameById to get all relevant data for a game
// async function getAllGameDataById(id){
 
//   let select = `SELECT ga.game_name, `;
//   let from = `FROM games ga `;
//   let join = ``;
//   let where = ` WHERE ga.game_id=$1`;

//   const categories = await getAllCategories();
//   categories.forEach((category, index) => {
//     console.log(category.table_name, category.col_name, index);
//     let indexStr = index.toString();
//     let relAlias = 'r' + indexStr;
//     let tableAlias = 't' + indexStr;
//     let colAlias = 't' + indexStr + ".";

//     select += colAlias + category.col_name + `_name, `;
//     join += `JOIN games_`+ category.table_name +` `+ relAlias + ` ON ga.game_id = ` + relAlias+`.game_id`;
//     join += ` `;
//     join += `JOIN ` + category.table_name + ` ` + tableAlias + ` ON ` + tableAlias +`.`+category.col_name+`_id = `+relAlias+`.`+category.col_name+`_id`;
//     join += ` `;
//   })
//   select = select.slice(0, -2);
//   select += ` `;
//   join = join.slice(0, - 1);


//   console.log('Constructing statement...');
//   sql = select + from + join + where;
//   sql += `;`;
//   console.log(sql);

//   const { rows } = await pool.query(sql,[id])
//   return rows;
// }

// Old Function
// async function getAllCategories(){
//   const sql = `SELECT * FROM categories`;
//   const { rows } = await pool.query(sql);
//   return rows;
// }
