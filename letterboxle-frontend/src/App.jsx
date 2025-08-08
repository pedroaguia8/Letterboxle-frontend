import { useState } from 'react';
import './App.css'
import MovieSearch from './MovieSearch';

// We'll put our mock hint data here for now.
const hintsData = [
  { label: "Tagline", value: "An adventure 65 million years in the making." },
  { label: "Genre", value: "Adventure, Sci-Fi" },
  { label: "Year", value: "1993" },
  { label: "Director", value: "Steven Spielberg" },
  { label: "Cast", value: "Sam Neill, Laura Dern, Jeff Goldblum" },
  { label: "Budget", value: "$63,000,000" },
];

function App() {
  const [currentGuess, setCurrentGuess] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSkip = () => {
    if (currentGuess < hintsData.length) {
      setCurrentGuess(currentGuess + 1);
    }
  };

  const handleMovieSelection = (movie) => {
    setSelectedMovie(movie);
  };

  const handleSubmit = () => {
    // Check if a movie has been selected before trying to submit
    if (selectedMovie) {
      console.log('User submitted a guess:', selectedMovie.name);
      // For now, we'll just log it. The actual game logic will go here later.
      // Next steps will be to check if this is the correct movie.
    }
  };

  return (
    <>
      <div className="app">
        <header className="header">
          <h1>🎬 Letterboxle 🍿</h1>
          <p>Guess the movie</p>
        </header>
      </div>

      <main className="grid">
        {hintsData.map((hint, index) => {
          const guessNumber = index + 1;
          const isRevealed = guessNumber <= currentGuess;

          return (
            <div className='guess-row' key={index}>
              {isRevealed && <p className='hint-label'>{hint.label}:</p>}
              {isRevealed && <p className="hint-value">{hint.value}</p>}
            </div>
          );  
        })}

        <MovieSearch onSelectMovie={handleMovieSelection} />

        <div className="button-group">
            <button className="skip-button" onClick={handleSkip}>Skip</button>
            <button
				className="submit-button"
				onClick={handleSubmit}
				disabled={!selectedMovie}
			>
				Submit
			</button>
        </div>
      </main>
    </>
  )
}

export default App
