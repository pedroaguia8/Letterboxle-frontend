import { useState } from 'react';

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

    const handleSearchChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        if (newQuery.length > 0) {
            // Filter the movie list to find matches
            const filteredSuggestions = mockMovies.filter(movie =>
                movie.name.toLowerCase().includes(newQuery.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
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