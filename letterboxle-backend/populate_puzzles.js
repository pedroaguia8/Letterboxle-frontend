// populate_puzzles.js
import sql from './db.js';

/**
 * Fetches 30 random movies and inserts them into the daily_puzzles table for the next 30 days.
 */
async function populateDailyPuzzles() {
  console.log('🚀 Starting puzzle population script...');

  try {
    // 1. Fetch 30 random movies with popularity > 30
    console.log('🔍 Fetching 30 random movies from the database...');
    const movies = await sql`
      SELECT id, title, year, tagline, genres, budget, director, actor1, actor2
      FROM movies
      WHERE popularity > 30
      ORDER BY RANDOM()
      LIMIT 30
    `;

    // Check if we found enough movies
    if (movies.length < 30) {
      console.warn(`⚠️ Warning: Found only ${movies.length} movies with popularity > 30. Please add more movies to the 'movies' table.`);
      if (movies.length === 0) {
        console.log('No movies to process. Exiting.');
        return; // Exit if no movies are found
      }
    } else {
      console.log(`✅ Successfully fetched ${movies.length} movies.`);
    }

    // 2. Prepare the data for insertion
    const startDate = new Date();
    const puzzlesToInsert = movies.map((movie, index) => {
      // Calculate the date for the current puzzle
      const puzzleDate = new Date(startDate);
      puzzleDate.setDate(startDate.getDate() + index);

      return {
        // Map movie data to the daily_puzzles table columns
        date: puzzleDate.toISOString().split('T')[0], // Format as 'YYYY-MM-DD'
        movie_id: movie.id,
        title: movie.title,
        year: movie.year,
        tagline: movie.tagline,
        genres: movie.genres,
        budget: movie.budget,
        director: movie.director,
        actor1: movie.actor1,
        actor2: movie.actor2,
      };
    });
    
    console.log(`📝 Preparing to insert ${puzzlesToInsert.length} puzzles...`);

    // 3. Insert the new puzzles into the daily_puzzles table
    // The 'postgres' library can efficiently handle inserting an array of objects.
    // We add an ON CONFLICT clause to prevent errors if a puzzle for a specific date already exists.
    const result = await sql`
      INSERT INTO daily_puzzles ${sql(puzzlesToInsert)}
      ON CONFLICT (date) DO NOTHING
    `;

    console.log(`✅ Successfully inserted ${result.count} new puzzles.`);
    if (result.count < puzzlesToInsert.length) {
        console.log(`ℹ️  ${puzzlesToInsert.length - result.count} puzzles were skipped because puzzles for those dates already exist.`);
    }

  } catch (error) {
    console.error('❌ An error occurred:', error);
  } finally {
    // 4. Always close the database connection
    await sql.end();
    console.log('👋 Database connection closed. Script finished.');
  }
}

// Run the script
populateDailyPuzzles();