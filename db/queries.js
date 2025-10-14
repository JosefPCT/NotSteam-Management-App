const pool = require('./pool');

async function getGames(){
  const { rows } =  await pool.query(`SELECT * FROM games;`);
  return rows;
}

async function getGameById(id){
  const sql = `SELECT * FROM games WHERE id=$1;`
  const { rows } = await pool.query(sql,[id]);
  return rows;
}

module.exports = {
  getGames,
  getGameById
}