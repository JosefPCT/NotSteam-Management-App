#! /usr/bin/env node

const { argv } = require('node:process');
const { Client } = require('pg');

const SQL = `
CREATE TABLE games(
game_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
game_name VARCHAR (255)
);

CREATE TABLE genres(
genre_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
genre_name VARCHAR (255)
);

CREATE TABLE games_genres(
game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
genre_id INTEGER NOT NULL REFERENCES genres(genre_id) ON DELETE CASCADE,
PRIMARY KEY (game_id, genre_id)
);

CREATE TABLE developers(
developer_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
developer_name VARCHAR (255)
);

CREATE TABLE games_developers(
game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
developer_id INTEGER NOT NULL REFERENCES developers(developer_id) ON DELETE CASCADE,
PRIMARY KEY (game_id, developer_id)
);

INSERT INTO games(game_name)VALUES
('Hades'),
('Don''t Starve'),
('Stardew Valley');

INSERT INTO genres(genre_name) VALUES
('Roguelike'),
('Isometric'),
('Survival'),
('Horror'),
('Farming Simulator'),
('Addicting');

INSERT INTO games_genres(game_id,genre_id) VALUES
(1,1),
(1,3),
(1,6),
(2,3),
(2,4),
(3,6),
(3,5);

INSERT INTO developers(developer_name) VALUES
('Concerned Ape'),
('Supergiant Games'),
('Klei Entertainment');

INSERT INTO games_developers(game_id, developer_id) VALUES
(1,2),
(2,3),
(3,1);
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

