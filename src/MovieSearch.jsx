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

    // Only show the year when another suggestion has the same title,
    // since the year is itself one of the hints
    const titleCounts = {};
    suggestions.forEach((movie) => {
        const key = movie.title.toLowerCase();
        titleCounts[key] = (titleCounts[key] || 0) + 1;
    });
    const formatMovie = (movie) =>
        titleCounts[movie.title.toLowerCase()] > 1 ? `${movie.title} (${movie.year})` : movie.title;

    const handleSelect = (movie) => {
        setQuery(formatMovie(movie));
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
                    {formatMovie(movie)}
                    </li>
                ))}
                </ul>
            )}
            
        </div>
    );
}

export default MovieSearch;