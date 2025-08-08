const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// We'll put our data here to simulate a database for now
const dailyPuzzle = {
    title: "Jurassic Park",
    year: 1993,
    hints: [
        { label: "Tagline", value: "An adventure 65 million years in the making." },
        { label: "Genre", value: "Adventure, Sci-Fi" },
        { label: "Director", value: "Steven Spielberg" },
        { label: "Cast", value: "Sam Neill, Laura Dern, Jeff Goldblum" },
        { label: "Budget", value: "$63,000,000" },
        { label: "Box Office", value: "$1.034 billion" },
    ]
};

const mockMovies = [
    { name: "Jurassic Park", year: 1993 },
    { name: "Jumanji", year: 1995 },
    { name: "Jurassic World", year: 2015 },
    { name: "Jurassic Park III", year: 2001 },
    { name: "The Lost World: Jurassic Park", year: 1997 },
    { name: "Indiana Jones and the Last Crusade", year: 1989 },
];

app.use(cors());

// Endpoint to get the hints for the daily movie
app.get('/api/daily-puzzle', (req, res) => {
    res.json(dailyPuzzle);
});

// Endpoint to get movie suggestions based on a query
app.get('/api/search-movies', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.json([]);
    }

    const filteredMovies = mockMovies.filter(movie =>
        movie.name.toLowerCase().includes(query.toLowerCase())
    );

    res.json(filteredMovies.slice(0, 6));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});