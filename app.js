const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeOfDatabaseServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Connected to server");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeOfDatabaseServer();

// Get movie by names

app.get("/movies/", async (request, response) => {
  const moviesArrayQuery = `
        SELECT 
        movie_name
        FROM movie
    `;
  const moviesArray = await db.all(moviesArrayQuery);
  let moviesArrayinCamel = [];
  for (let obj of moviesArray) {
    let newObj = {
      movieName: obj.movie_name,
    };
    moviesArrayinCamel.push(newObj);
  }
  response.send(moviesArrayinCamel);
});

// Creating a new movie

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO 
      movie(director_id,movie_name,lead_actor)
    VALUES
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );
  `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Getting movie based on movie Id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
        SELECT 
            *
         FROM
        movie 
        WHERE
         movie_id = ${movieId};`;

  const movieObj = await db.get(movieQuery);

  response.send(request.params);
});

// Updating Movie

app.put("movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieUpdQuery = `
        UPDATE 
        movie
        SET 
        
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
        WHERE movie_id = '${movieId}'
    ;`;
  await db.run(movieUpdQuery);
  response.send("Movie Details Updated");
});

// Deleting a movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE
        FROM movie
        WHERE movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  response.send(movieId);
});

// Returning Directors

app.get("/directors/", async (request, response) => {
  const directorQuery = `
        SELECT 
         *
        FROM
        director;
    `;
  const directorsData = await db.all(directorQuery);
  let directorDataCamel = [];
  for (let obj of directorsData) {
    let newObj = {
      directorId: obj.director_id,
      directorName: obj.director_name,
    };
    directorDataCamel.push(newObj);
  }
  response.send(directorDataCamel);
});

// movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorsQuery = `
        SELECT 
         movie_name
        FROM
        movies
        WHERE director_id = ${directorId};
    `;
  const directorsDb = await db.all(directorsQuery);
  response.send(directorsDb);
});

module.exports = express;
