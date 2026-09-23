import { useState, useRef } from 'react';

const debounceTimeout = 500;

function MovieSearch({ query, setQuery, movieList, isMovieListReady, onSelectMovie }) {
    const [suggestions, setSuggestions] = useState([]);
    // a ref doesn't cause the page to reload when it changes
    const timeoutRef = useRef(null);

    const handleSearchChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        onSelectMovie(null);

        // Clear the previous timeout to debounce the search.
        // This is the core of the debouncing logic.
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout that will run after the value of debounceTimeout ms.
        timeoutRef.current = setTimeout(() => {
            if (newQuery.length > 0) {
                const lowerQuery = newQuery.toLowerCase();
                setSuggestions(movieList.filter((movie) => movie.title.toLowerCase().includes(lowerQuery)));
            } else {
                setSuggestions([]);
            }
        }, debounceTimeout);
    }

    const handleSelect = (movie) => {
        setQuery(`${movie.title} (${movie.year})`);
        // When a user clicks a suggestion, we pass it up to the parent component
        onSelectMovie(movie);
        // Clear the suggestions after selection
        setSuggestions([]);
    };
    
    return (
        <div className="guess-controls">
            <input
                type="text"
                className="guess-input"
                value={query}
                onChange={handleSearchChange}
                placeholder="Enter your guess"
                disabled={!isMovieListReady}
            />
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                {suggestions.map((movie) => (
                    <li key={movie.id} onClick={() => handleSelect(movie)}>
                    {movie.title} ({movie.year})
                    </li>
                ))}
                </ul>
            )}
            
        </div>
    );
}

export default MovieSearch;