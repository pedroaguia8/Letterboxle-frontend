import { useState, useEffect } from 'react';
import './App.css'
import MovieSearch from './MovieSearch';
import Modal from './Modal';

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
        const response = await fetch('/api/daily-puzzle');
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
      if (currentGuess < hints.length) {
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
      if (selectedMovie.name === correctMovieName 
				&& selectedMovie.year === correctMovieYear) {
        setGameStatus('won');
		setIsModalOpen(true);
      } else {
        console.log('Incorrect guess. Try again.');
		if (currentGuess < hints.length) {
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
        {hints.map((hint, index) => {
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
            <p>The movie was: {correctMovieName} ({correctMovieYear})</p>
          </>
        )}
        {gameStatus === 'lost' && (
          <>
            <h2>Nice Try!</h2>
            <p>The movie was: {correctMovieName} ({correctMovieYear})</p>
          </>
        )}
      </Modal>
    </>
  )
}

export default App
