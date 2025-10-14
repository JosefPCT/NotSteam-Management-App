const pool = require('./pool');

async function getGames(){
  const { rows } =  await pool.query(`SELECT * FROM games;`);
  return rows;
}

module.exports = {
  getGames
}