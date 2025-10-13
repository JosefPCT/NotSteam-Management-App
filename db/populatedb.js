#! /usr/bin/env node

const { argv } = require('node:process');
const { Client } = require('pg');

const SQL = `
CREATE TABLE IF NOT EXISTS games(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  game_name VARCHAR (255)
);

INSERT INTO games(game_name)
VALUES
  ('Hades'),
  ('Dont Starve')
`;

async function main(){
  console.log("..seeding");
  const client = new Client({
    // Format: postgresql://jpvm:jpdb123@localhost:5432/local_game_management
    connectionString: argv[2]
  })
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done seeding");
}

main();

