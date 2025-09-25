// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('./db.js');


const app = express();
const PORT = process.env.PORT || 3012;

app.use(cors());

// Endpoint to get the hints for the daily movie
app.get('/api/daily-puzzle', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const puzzles = await sql`
      SELECT
        m.title,
        m.year,
        m.tagline,
        m.genres,
        m.director,
        m.actor1,
        m.actor2
      FROM
        daily_puzzle dp
      JOIN
        movies m ON dp.movie_id = m.id
      WHERE
        dp.date = ${today}
    `;

    if (puzzles.length === 0) {
      return res.status(404).json({ error: "No puzzle found for today." });
    }

    const puzzleFromDb = puzzles[0];

    // Format the database data into the structure the frontend expects
    const formattedPuzzle = {
      title: puzzleFromDb.title,
      year: puzzleFromDb.year,
      hints: [
        { label: "Tagline", value: puzzleFromDb.tagline },
        { label: "Genres", value: puzzleFromDb.genres },
        { label: "Director", value: puzzleFromDb.director },
        { label: "Actor 1", value: puzzleFromDb.actor1 },
        { label: "Actor 2", value: puzzleFromDb.actor2 },
        { label: "Year", value: puzzleFromDb.year },
      ].filter(hint => hint.value), // Filter out any hints with null/empty values
    };

    res.json(formattedPuzzle);
  } catch (error) {
    console.error('Failed to fetch daily puzzle:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get movie suggestions based on a query
app.get('/api/search-movies', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json([]);
  }

  try {
    // Search the 'movies' table for titles that match the query
    // ILIKE is a case-insensitive version of LIKE
    const movies = await sql`
      SELECT title, year FROM movies
      WHERE title ILIKE ${'%' + query + '%'}
      LIMIT 12
    `;

    // Map the results to the { name, year } format for the frontend
    const suggestions = movies.map(movie => ({
      name: movie.title,
      year: movie.year,
    }));

    res.json(suggestions);
  } catch (error) {
    console.error('Failed to search movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});