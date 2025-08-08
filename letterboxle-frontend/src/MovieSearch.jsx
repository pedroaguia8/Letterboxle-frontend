import { useState, useRef } from 'react';

const debounceTimeout = 500;

const mockMovies = [
  { name: "Jurassic Park", year: 1993 },
  { name: "Jumanji", year: 1995 },
  { name: "Jurassic World", year: 2015 },
  { name: "Jurassic Park III", year: 2001 },
  { name: "The Lost World: Jurassic Park", year: 1997 },
  { name: "Indiana Jones and the Last Crusade", year: 1989 },
];

function MovieSearch({ onSelectMovie }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    // a ref doesn't cause the page to reload when it changes
    const timeoutRef = useRef(null);

    const handleSearchChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        // Clear the previous timeout to debounce the search.
        // This is the core of the debouncing logic.
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout that will run after the value of debounceTimeout ms.
        timeoutRef.current = setTimeout(() => {
            if (newQuery.length > 0) {
                // Filter the movie list to find matches
                const filteredSuggestions = mockMovies.filter(movie =>
                    movie.name.toLowerCase().includes(newQuery.toLowerCase())
                );
                setSuggestions(filteredSuggestions.slice(0, 6));

                if (!mockMovies.some(movie => `${movie.name} (${movie.year})` === newQuery)) {
                    onSelectMovie(null);
                }
            } else {
                setSuggestions([]);
                onSelectMovie(null);
            }
        }, debounceTimeout);
    }

    const handleSelect = (movie) => {
        setQuery(`${movie.name} (${movie.year})`);
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
            />
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                {suggestions.map((movie) => (
                    <li key={`${movie.name}-${movie.year}`} onClick={() => handleSelect(movie)}>
                    {movie.name} ({movie.year})
                    </li>
                ))}
                </ul>
            )}
            
        </div>
    );
}

export default MovieSearch;