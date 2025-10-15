const pool = require('./pool');

async function getGames(){
  const { rows } =  await pool.query(`SELECT * FROM games;`);
  return rows;
}

// Refactor to use a query to JOIN other tables for complete information on the game including genres and developers, and other categories it may have
async function getGameById(id){
  const sql = `SELECT * FROM games WHERE game_id=$1;`
  const { rows } = await pool.query(sql,[id]);
  return rows;
}

module.exports = {
  getGames,
  getGameById
}