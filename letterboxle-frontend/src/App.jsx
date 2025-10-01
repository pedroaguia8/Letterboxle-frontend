import { useState, useEffect } from 'react';
import Confetti from 'react-confetti-boom';
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
  const [posterUrl, setPosterUrl] = useState(null);
  const [hints, setHints] = useState([]);
  const [puzzleDate, setPuzzleDate] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [shareText, setShareText] = useState('Share');
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        const response = await fetch('/api/daily-puzzle');
        const data = await response.json();
        setPuzzleDate(data.date); 
        setCorrectMovieName(data.title);
        setCorrectMovieYear(data.year);
        setHints(data.hints);
        setPosterUrl(data.posterUrl);
      } catch (error) {
        console.error("Failed to fetch daily puzzle:", error);
      }
    };
    fetchPuzzle();
  }, []);

  const formattedDate = () => {
    if (!puzzleDate) return '';
    const date = new Date(puzzleDate);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

	
  const handleSkip = () => {
    if (gameStatus === 'playing') {
      setGuessHistory([...guessHistory, '⬇️']);
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
    if (selectedMovie) {
      if (selectedMovie.name === correctMovieName 
				&& selectedMovie.year === correctMovieYear) {
          setGuessHistory([...guessHistory, '🟩']);
          setGameStatus('won');
          setIsModalOpen(true);
      } else {
        setGuessHistory([...guessHistory, '❌']);
        setIsIncorrect(true);
        setTimeout(() => setIsIncorrect(false), 500); // Duration must match the CSS animation
        
		if (currentGuess < hints.length) {
          setCurrentGuess(currentGuess + 1);
        } else {
			setGameStatus('lost');
			setIsModalOpen(true);
		}
      }

	  setSelectedMovie(null);
    setSearchQuery('');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShareText('Share');
  };

  const handleShare = () => {
    const title = `Letterboxle ${formattedDate()}`;
    const score = gameStatus === 'won' ? `Guessed in ${currentGuess}/${hints.length}` : `X/${hints.length}`;
    
    const grid = hints.map((hint, index) => {
      const emoji = index < guessHistory.length ? guessHistory[index] : '⬜';
      return `${emoji} ${hint.label}`;
    }).join('\n');

    const shareableText = `${title}\n${score}\n${grid}\nGuess today's movie: https://letterboxle.pedroaguia8.dev`;

    navigator.clipboard.writeText(shareableText).then(() => {
      setShareText('Copied!');
      setTimeout(() => {
        setShareText('Share');
      }, 2000); // Reset text after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <>
      {gameStatus === 'won' && (
        // Envolvemos o Confetti numa div para aplicar o estilo
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti
            mode="boom"
            spreadDeg={100}
            // launchSpeed={5}
          />
        </div>
      )}
      <div className="app">
        <header className="header">
          <h1>🎬 Letterboxle 🍿</h1>
          {puzzleDate && <p className="puzzle-date">{formattedDate()}</p>}
          <p>Guess today's movie!</p>
        </header>

        <main className={`grid ${isIncorrect ? 'shake' : ''}`}>
          {hints.map((hint, index) => {
            const guessNumber = index + 1;
            const isRevealed = guessNumber <= currentGuess || gameStatus !== 'playing';

            return (
              <div className='guess-row' key={index}>
                {isRevealed && <p className='hint-label'>{hint.label}:</p>}
                {isRevealed && <p className="hint-value">{hint.value}</p>}
              </div>
            );  
          })}
          {gameStatus === 'playing' && (
            <>
              <MovieSearch
                query={searchQuery}
                setQuery={setSearchQuery}
                onSelectMovie={handleMovieSelection} />

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
          {gameStatus !== 'playing' && !isModalOpen && (
            <div className="show-score-container">
              <button 
                className="show-score-button" 
                onClick={() => setIsModalOpen(true)}
              >
                Show your score
              </button>
            </div>
          )}

          <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
            {gameStatus === 'won' && (
              <>
                <h2>You Won in {currentGuess} Guesses!</h2>
                {posterUrl && <img src={posterUrl} alt="Movie Poster" className="modal-poster" />}
                <p>The movie was: {correctMovieName} ({correctMovieYear})</p>
              </>
            )}
            {gameStatus === 'lost' && (
              <>
                <h2>Nice Try!</h2>
                {posterUrl && <img src={posterUrl} alt="Movie Poster" className="modal-poster" />}
                <p>The movie was: {correctMovieName} ({correctMovieYear})</p>
              </>
            )}
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <button className="share-button" onClick={handleShare}>
                {shareText}
              </button>
            )}
          </Modal>
        </main>
      </div>
    </>
  )
}

export default App
