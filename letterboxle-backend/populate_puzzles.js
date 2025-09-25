import sql from './db.js';

/**
 * A utility function to shuffle an array in place using the Fisher-Yates algorithm.
 * @param {Array} array The array to shuffle.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

/**
 * Fetches all popular movies and populates the daily_puzzle table with a unique
 * puzzle for each day, starting from today. This is a one-time script.
 */
async function populateDailyPuzzles() {
  console.log('Starting one-time puzzle population script...');

  try {
    // Check if puzzles already exist to prevent running this twice.
    const existingPuzzles = await sql`SELECT COUNT(*) FROM daily_puzzle`;
    if (parseInt(existingPuzzles[0].count, 10) > 0) {
      console.warn(`The 'daily_puzzle' table is not empty. Found ${existingPuzzles[0].count} puzzles.`);
      console.log('To prevent overwriting data, the script will not run.'
        + ' Please clear the table manually if you want to repopulate it.');
      return;
    }
    console.log("'daily_puzzle' table is empty. Proceeding with population.");


    // Fetch the IDs of all movies with popularity > 30
    console.log('Fetching all popular movie IDs...');
    const popularMovies = await sql`
      SELECT id FROM movies WHERE popularity > 30
    `;

    if (popularMovies.length === 0) {
      console.error('No movies found with popularity > 30. Cannot create puzzles.');
      return;
    }

    const movieIds = popularMovies.map(movie => movie.id);
    console.log(`Found ${movieIds.length} popular movies.`);

    // Shuffle the array of movie IDs randomly
    console.log('Shuffling movie IDs for random puzzle distribution...');
    shuffleArray(movieIds);
    console.log('Movie IDs have been shuffled.');

    // 4. Prepare the data for insertion
    const startDate = new Date();
    const puzzlesToInsert = movieIds.map((movieId, index) => {
      const puzzleDate = new Date(startDate);
      puzzleDate.setDate(startDate.getDate() + index);

      return {
        date: puzzleDate.toISOString().split('T')[0], // Format as 'YYYY-MM-DD'
        movie_id: movieId,
      };
    });

    console.log(`Preparing to insert ${puzzlesToInsert.length} puzzles into the 'daily_puzzle' table...`);

    // Insert the new puzzles into the 'daily_puzzle' table
    const result = await sql`
      INSERT INTO daily_puzzle ${sql(puzzlesToInsert)}
    `;

    console.log(`Successfully inserted ${result.count} new puzzles.`);

  } catch (error) {
    console.error('An error occurred during puzzle population:', error);
  } finally {
    await sql.end();
    console.log('Database connection closed. Script finished.');
  }
}

populateDailyPuzzles();