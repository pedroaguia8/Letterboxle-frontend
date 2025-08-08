import { useState, useEffect } from 'react';
import './App.css'
import MovieSearch from './MovieSearch';
import Modal from './Modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [correctMovieName, setCorrectMovieName] = useState();
  const [correctMovieYear, setCorrectMovieYear] = useState();
  const [hints, setHints] = useState([]);

  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/daily-puzzle');
        const data = await response.json();
		setCorrectMovieName(data.title);
		setCorrectMovieYear(data.year);
        setHints(data.hints);
      } catch (error) {
        console.error("Failed to fetch daily puzzle:", error);
      }
    };
    fetchPuzzle();
  }, []);
	
  const handleSkip = () => {
    if (gameStatus === 'playing') {
      if (currentGuess < hintsData.length) {
        setCurrentGuess(currentGuess + 1);
      } else {
        setGameStatus('lost');
		setIsModalOpen(true);
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
		setIsModalOpen(true);
      } else {
        console.log('Incorrect guess. Try again.');
		if (currentGuess < hintsData.length) {
          setCurrentGuess(currentGuess + 1);
        } else {
			setGameStatus('lost');
			setIsModalOpen(true);
		}
      }

	  setSelectedMovie(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

      </main>

	  <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {gameStatus === 'won' && (
          <>
            <h2>You Won in {currentGuess} Guesses!</h2>
            <p>The movie was: {correctMovie.name} {correctMovie.year}</p>
          </>
        )}
        {gameStatus === 'lost' && (
          <>
            <h2>Nice Try!</h2>
            <p>The movie was: {correctMovie.name} {correctMovie.year}</p>
          </>
        )}
      </Modal>
    </>
  )
}

export default App
