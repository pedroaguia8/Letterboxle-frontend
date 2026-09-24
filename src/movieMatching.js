export const maxSuggestions = 8;

// Lowercase and strip accents, so "amelie" finds "Amélie"
const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

// Split into words on anything that isn't a letter or digit (spaces,
// hyphens, dots, apostrophes...)
const toWords = (text) => normalize(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

// Lower is better: exact title, then title prefix, then word prefix, then
// anywhere in the title. Ranking before capping means an exact match
// (e.g. "He", "M") can never be pushed out by longer titles that contain it.
// Returns null when the title doesn't match at all
const matchRank = (title, queryWords) => {
    const words = toWords(title);
    // Tiers 0-2 ignore spacing and punctuation, so "spiderman" finds
    // "Spider-Man" and "gi joe" finds "G.I. Joe". They stay anchored to the
    // start of a word: "spiderman" matches "The Amazing Spider-Man" from
    // the word "spider" onwards
    const compactQuery = queryWords.join('');
    const compactTitle = words.join('');
    if (compactTitle === compactQuery) return 0;
    if (compactTitle.startsWith(compactQuery)) return 1;
    if (words.some((_, i) => words.slice(i).join('').startsWith(compactQuery))) return 2;
    // Tier 3 keeps word breaks, so a query can't match letters that
    // straddle two words ("ear" shouldn't find "The Arrival")
    if (words.join(' ').includes(queryWords.join(' '))) return 3;
    return null;
};

// The best matches for what the user typed, best first, at most maxSuggestions
export const findSuggestions = (movieList, query) => {
    // Checked after splitting, so a query of only punctuation or
    // spaces doesn't match every title
    const queryWords = toWords(query);
    if (queryWords.length === 0) return [];
    return movieList
        .map((movie) => ({ movie, rank: matchRank(movie.title, queryWords) }))
        .filter(({ rank }) => rank !== null)
        // Within a tier, shorter titles are closer to what was typed
        .sort((a, b) => a.rank - b.rank || a.movie.title.length - b.movie.title.length)
        .slice(0, maxSuggestions)
        .map(({ movie }) => movie);
};
