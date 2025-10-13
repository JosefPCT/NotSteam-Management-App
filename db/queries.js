const pool = require('./pool');

async function getUsernames(){
  const { rows } =  await pool.query(`SELECT * FROM usernames`);
  return rows;
}

module.exports = {
  getUsernames
}