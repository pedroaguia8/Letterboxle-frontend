// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('./db.js');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3012;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(cors());

// Endpoint to get the hints for the daily movie
app.get('/api/daily-puzzle', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // e.g., "2025-09-25"

    const puzzles = await sql`
      SELECT
        m.id,
        m.title,
        m.year,
        m.tagline,
        m.genres,
        m.director,
        m.actor1,
        m.actor2,
        m.poster_url
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

    // Check if the poster URL is NULL. We check for NULL specifically.
    // An empty string '' means we've already checked and found nothing.
    if (puzzleFromDb.poster_url === null) {
      console.log(`Poster URL not found for "${puzzleFromDb.title}". Fetching from TMDB...`);
      try {
        // If not, fetch from TMDB
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(puzzleFromDb.title)}&year=${puzzleFromDb.year}`;
        const tmdbResponse = await fetch(searchUrl);
        const tmdbData = await tmdbResponse.json();

        let urlToSave = ''; 

        if (tmdbData.results && tmdbData.results.length > 0) {
          const posterPath = tmdbData.results[0].poster_path;
          if (posterPath) {
            // If we find a poster, update urlToSave with the full URL.
            urlToSave = `https://image.tmdb.org/t/p/w500${posterPath}`;
          }
        }
        
        // 2. ALWAYS update the database.
        // It will save the URL or the empty string placeholder.
        await sql`
          UPDATE movies
          SET poster_url = ${urlToSave}
          WHERE id = ${puzzleFromDb.id}
        `;

        // 3. Update our current object to send the correct value in the response.
        puzzleFromDb.poster_url = urlToSave;
        
        if (urlToSave) {
            console.log(`✅ Successfully fetched and saved poster URL.`);
        } else {
            console.log(`✔️ No poster found. Saved empty placeholder to prevent re-fetching.`);
        }

      } catch (tmdbError) {
        console.error('Failed to fetch from TMDB or update DB:', tmdbError);
      }
    } else {
      console.log(`🚀 Found cached poster URL for "${puzzleFromDb.title}" in DB.`);
    }

    // Format the database data into the structure the frontend expects
    const formattedPuzzle = {
      date: today,
      title: puzzleFromDb.title,
      year: puzzleFromDb.year,
      posterUrl: puzzleFromDb.poster_url,
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