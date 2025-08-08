import { useState } from 'react';
import './App.css'
import MovieSearch from './MovieSearch';

// later we will pull this from the backend
const correctMovie = { name: "Jurassic Park", year: 1993 };

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
  const [gameStatus, setGameStatus] = useState('playing');

  const handleSkip = () => {
    if (gameStatus === 'playing') {
      if (currentGuess < hintsData.length) {
        setCurrentGuess(currentGuess + 1);
      } else {
        setGameStatus('lost');
      }
    }
  };

  const handleMovieSelection = (movie) => {
    setSelectedMovie(movie);
  };

  const handleSubmit = () => {
    // Check if a movie has been selected before trying to submit
    if (selectedMovie) {
      if (selectedMovie.name === correctMovie.name 
				&& selectedMovie.year === correctMovie.year) {
        setGameStatus('won');
      } else {
        console.log('Incorrect guess. Try again.');
		if (currentGuess < hintsData.length) {
          setCurrentGuess(currentGuess + 1);
        } else {
			setGameStatus('lost');
		}
      }

	  setSelectedMovie(null);
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
		{gameStatus === 'playing' && (
			<>
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
			</>
		)}

		{/* ⭐️ Display a message when the game is over */}
        {gameStatus === 'won' && <h2>You won! Congratulations!</h2>}
        {gameStatus === 'lost' && (
			<h2>Game Over. The movie was {correctMovie.name} ({correctMovie.year}).</h2>
		)}

      </main>
    </>
  )
}

export default App
