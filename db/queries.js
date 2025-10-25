const pool = require('./pool');

// Table Creation
async function createTable(table_name, col_name){

  const sql = `
    CREATE TABLE ${table_name}(
    ${col_name}_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ${col_name}_name VARCHAR (255) UNIQUE
    );
  `;
  await pool.query(sql);
}

async function createRelationalTable(table_name, col_name){
  const sql = `
    CREATE TABLE games_${table_name}(
    game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    ${col_name}_id INTEGER NOT NULL REFERENCES ${table_name}(${col_name}_id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, ${col_name}_id)
    );
  `;
  await pool.query(sql);
}

async function insertDataToTable(table_name, col_name, data){
  const sql = `
    INSERT INTO ${table_name}(${col_name}_name) VALUES
    ($1)
  `;
  console.log(sql);

  await pool.query(sql, [data]);
}

// data should be the id of the column
async function deleteDataFromTableById(table_name, col_name, data){
  const sql = `
    DELETE FROM ${table_name}
    WHERE ${col_name}_id = $1
  `;

  await pool.query(sql, [data]);
}

async function dropTable(table_name){
  const sql = `
    DROP TABLE ${table_name};
  `;

  await pool.query(sql);
}

async function dropRelationalTable(table_name){
  const sql = `
    DROP TABLE games_${table_name};
  `;

  await pool.query(sql);
}

async function dataExistsInTable(table_name, col_name, data){
  const sql = `
    SELECT 1
    FROM ${table_name}
    WHERE ${col_name}_name = $1
  `;

  const { rows } = await pool.query(sql, [data]);
  console.log(rows);
  if(rows.length ===  0 ){
    return false;
  } else {
    return true;
  }
}

async function renameTable(old_tableName, new_tableName){
  const sql = `
    ALTER TABLE IF EXISTS ${old_tableName}
    RENAME TO ${new_tableName};
  `;

  await pool.query(sql);
}

async function renameRelationalTable(old_tableName, new_tableName){
  const sql = `
    ALTER TABLE IF EXISTS games_${old_tableName} 
    RENAME TO games_${new_tableName};
  `;

  await pool.query(sql);
}

async function renameSequenceTable(old_tableName, new_tableName, old_colName, new_colName){
  const sql = `
    ALTER TABLE IF EXISTS ${old_tableName}_${old_colName}_id_seq 
    RENAME TO ${new_tableName}_${new_colName}_id_seq
  `;

  await pool.query(sql);
}

async function renameIdColumn(table_name, old_colName, new_colName){
  const sql = `
    ALTER TABLE ${table_name}
    RENAME COLUMN ${old_colName}_id TO ${new_colName}_id;
  `;

  await pool.query(sql);
}

async function renameNameColumn(table_name, old_colName, new_colName){
  const sql = `
    ALTER TABLE ${table_name}
    RENAME COLUMN ${old_colName}_name TO ${new_colName}_name;
  `;

  await pool.query(sql);
}

async function renameRelationalIdColumn(table_name, old_colName, new_colName){
  const sql = `
    ALTER TABLE games_${table_name}
    RENAME COLUMN ${old_colName}_id TO ${new_colName}_id;
  `;

  await pool.query(sql);
}

async function updateCategories(new_tableName, old_tableName, new_colName){
  const sql = `
    UPDATE categories
    SET table_name = '${new_tableName}', col_name = '${new_colName}'
    WHERE LOWER(table_name) = LOWER($1);
  `;

  await pool.query(sql, [old_tableName]);
}


async function getItemDataByTableAndId(table_name, col_name, id){
  const sql = `
    SELECT *
    FROM ${table_name}
    WHERE ${col_name}_id = $1
  `;

  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

async function updateItemDataByTableAndId(table_name, col_name, id, data){
  const sql = `
    UPDATE ${table_name}
    SET ${col_name}_name = $2
    WHERE ${col_name}_id = $1;
  `;

  await pool.query(sql, [id, data]);
}

async function getRelationalDataByTableAndId(table_name, col_name, game_id){
  const sql = `
    SELECT at.*
    FROM games g
    JOIN games_${table_name} art ON g.game_id = art.game_id
    JOIN ${table_name} at ON at.${col_name}_id = art.${col_name}_id
    WHERE g.game_id = $1;
  `;

  // console.log(sql);
  const { rows } = await pool.query(sql, [game_id]);
  // console.log("returning row");
  // console.log(rows);
  if(rows){
    return rows
  }
}


// Older Queries

// Categories

// INSERT to categories table
async function insertToCategories(table_name, col_name){
  const sql = `
    INSERT INTO categories(table_name, col_name) VALUES
    ($1, $2);
  `;

  await pool.query(sql, [table_name, col_name]);
}

// DELETE from categories table

async function deleteFromCategoriesByTableName(table_name){
  const sql = `
    DELETE FROM categories
    WHERE LOWER(table_name) = LOWER($1)
  `;
  await pool.query(sql, [table_name]);
}

// SELECT categories
async function getAllCategories(){
  const sql = `
    SELECT *
    FROM categories;
  `;

  const { rows } = await pool.query(sql);
  return rows;
}


async function getCategoryByTableName(table){
  const sql = `
    SELECT *
    FROM categories
    WHERE table_name = $1
  `;

  const { rows } = await pool.query(sql, [table]);
  return rows[0];
}

async function categoryExists(table_name){
  const sql = `
    SELECT 1
    FROM categories
    WHERE table_name = $1
  `;

  const { rows } = await pool.query(sql, [table_name]);

  if(rows.length === 0){
    return false;
  } else {
    return true;
  }
}

// SELECT general

async function getAllDataByTable(table){
  const sql = `
    SELECT * 
    FROM ` + table + `;`;

  const { rows } = await pool.query(sql);
  return rows;
}

async function getGames(){
  const sql = `
    SELECT *
    FROM games
    ORDER BY game_id;
  `;
  const { rows } =  await pool.query(sql);
  return rows;
}

async function getGameById(id){
 const sql = `
   SELECT *
   FROM games
   WHERE game_id=$1;
 `;

 const { rows } = await pool.query(sql, [id]);
 return rows;
}

async function searchGameByName(name){
 const pattern = `%${name}%`;
 const sql = `
   SELECT *
   FROM games
   WHERE LOWER(game_name) ILIKE LOWER($1)
 `;

 const { rows } = await pool.query(sql, [pattern])
 return rows;
}

// Get Game Data based on the relational table
async function getGamesByTable(table, toSearchData){
  const col_name = await getColNameOfTable(table);
  const pattern = `%${toSearchData}%`;
  const sql = `
    SELECT ga.*
    FROM games ga
    JOIN games_` + table + ` r1 ON ga.game_id = r1.game_id
    JOIN ` + table + ` t1 ON t1.`+ col_name +`_id = r1.` + col_name +`_id 
    WHERE LOWER(t1.` + col_name + `_name) ILIKE LOWER($1);
    `;
  console.log(sql);
  const { rows } = await pool.query(sql, [pattern]);
  return rows;
}

async function getGameGenresById(id){
 
 const sql = `
   SELECT ge.*
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
   SELECT d.*
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

  let col_name = await getColNameOfTable(table);
  // let col_name = table.slice(0, -1);

  const sql = `
  INSERT INTO games_` + table + `(game_id,` + col_name + `_id) 
    SELECT $1, $2
  WHERE NOT EXISTS (
    SELECT 1 FROM games_` + table + ` WHERE game_id = $1 AND ` + col_name +`_id = $2
  );
  `;
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

async function updateRelationByTable(game_id, data_id, table){
  // Alternative: Query to categories table to get column name of the table, might need to create a category table
  // let col_name = table.slice(0, -1);

  let col_name = await getColNameOfTable(table);

  console.log('table name', table)
  console.log('col name', col_name);
  const sql = `
    UPDATE games_` + table +
    ` SET game_id = $1, ` + col_name + `_id = $2
    WHERE game_id = $1;
  `;
  console.log('sql', sql);
  await pool.query(sql, [game_id,data_id]);
}

// Deleting
async function deleteGameById(id){
  const sql = `
    DELETE FROM games
    WHERE game_id=$1;
  `;
  await pool.query(sql, [id]);
}

async function deleteAllGenresOfGameById(id){
  const sql = `
    DELETE FROM games_genres
    WHERE game_id = $1
  `;

  await pool.query(sql, [id]);
}

// Helper Functions

async function getColNameOfTable(table){
  const sql = `
    SELECT col_name
    FROM categories
    WHERE table_name = $1;
  `;
  const { rows } = await pool.query(sql, [table]);
  return rows[0].col_name;
}

async function checkGameExists(game_name){
  const sql = `
    SELECT 1
    FROM games
    WHERE game_name = $1
  `;

  const { rows } = await pool.query(sql, [game_name]);

  if(rows.length === 0){
    return false;
  } else {
    return true;
  }
}

async function getGameNameById(id){
  console.log('Get game name...');
  const sql = `
    SELECT game_name
    FROM games
    WHERE game_id = $1;
  `;

  const { rows } = await pool.query(sql, [id]);
  return rows[0].game_name;
}

async function testQuery(){

}

module.exports = {
  createTable,
  createRelationalTable,
  insertDataToTable,
  deleteDataFromTableById,
  dropTable,
  dropRelationalTable,
  dataExistsInTable,
  renameTable,
  renameRelationalTable,
  renameSequenceTable,
  renameIdColumn,
  renameNameColumn,
  renameRelationalIdColumn,
  updateCategories,
  getItemDataByTableAndId,
  updateItemDataByTableAndId,
  getRelationalDataByTableAndId,
  insertToCategories,
  deleteFromCategoriesByTableName,
  categoryExists,
  getCategoryByTableName,
  getAllDataByTable,
  getGames,
  searchGameByName,
  getGamesByTable,
  getGameById,
  getGameGenresById,
  getGameDeveloperById,
  getAllCategories,
  insertGame,
  insertRelationByTable,
  updateRelationByTable,
  updateGame,
  deleteGameById,
  deleteAllGenresOfGameById,
  checkGameExists,
  getGameNameById,
  testQuery
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

// async function getGamesByGenre(genre){
//   const sql = `
//    SELECT ga.*
//    FROM games ga
//    JOIN games_genres gg ON ga.game_id = gg.game_id
//    JOIN genres ge ON ge.genre_id = gg.genre_id
//    WHERE LOWER(ge.genre_name) = LOWER($1);
//   `;

//   const { rows } = await pool.query(sql, [genre]);
//   return rows;
// }