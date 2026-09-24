import { describe, it, expect } from 'vitest';
import { findSuggestions, maxSuggestions } from './movieMatching';

const toMovies = (titles) => titles.map((title, id) => ({ id, title, year: 2000 }));

// Titles of the suggestions, in the order they'd be shown
const suggest = (titles, query) => findSuggestions(toMovies(titles), query).map((movie) => movie.title);

describe('findSuggestions', () => {
    describe('empty queries', () => {
        it('returns nothing for an empty query', () => {
            expect(suggest(['Heat'], '')).toEqual([]);
        });

        it('returns nothing for a query of only spaces or punctuation', () => {
            expect(suggest(['Heat', 'Spider-Man'], '   ')).toEqual([]);
            expect(suggest(['Heat', 'Spider-Man'], '---')).toEqual([]);
            expect(suggest(['Heat', 'Spider-Man'], '. : !')).toEqual([]);
        });
    });

    describe('normalization', () => {
        it('ignores case', () => {
            expect(suggest(['RoboCop'], 'robocop')).toEqual(['RoboCop']);
            expect(suggest(['RoboCop'], 'ROBOCOP')).toEqual(['RoboCop']);
        });

        it('ignores accents in the title and the query', () => {
            expect(suggest(['Amélie'], 'amelie')).toEqual(['Amélie']);
            expect(suggest(['Amelie'], 'amélie')).toEqual(['Amelie']);
        });

        it('matches digits', () => {
            expect(suggest(['2001: A Space Odyssey'], '2001')).toEqual(['2001: A Space Odyssey']);
        });
    });

    describe('spacing and punctuation', () => {
        it('matches a hyphenated title typed without the hyphen', () => {
            expect(suggest(['Spider-Man'], 'spiderman')).toEqual(['Spider-Man']);
            expect(suggest(['Spider-Man'], 'spider man')).toEqual(['Spider-Man']);
        });

        it('matches a title typed with extra spaces', () => {
            expect(suggest(['RoboCop'], 'robo cop')).toEqual(['RoboCop']);
        });

        it('matches a title with dots typed without them', () => {
            expect(suggest(['G.I. Joe: The Rise of Cobra'], 'gi joe')).toEqual(['G.I. Joe: The Rise of Cobra']);
            expect(suggest(['G.I. Joe: The Rise of Cobra'], 'g.i. joe')).toEqual(['G.I. Joe: The Rise of Cobra']);
        });

        it('matches a title with an apostrophe typed without it', () => {
            expect(suggest(["Schindler's List"], 'schindlers')).toEqual(["Schindler's List"]);
        });

        it('matches from a word in the middle of the title, running into the next words', () => {
            expect(suggest(['The Amazing Spider-Man'], 'spiderman')).toEqual(['The Amazing Spider-Man']);
            expect(suggest(['G.I. Joe: The Rise of Cobra'], 'rise of')).toEqual(['G.I. Joe: The Rise of Cobra']);
        });

        it('treats a hyphen as a word break', () => {
            // "man" starts a word in "Spider-Man", but not in "Batman", so
            // Spider-Man ranks first despite being longer
            expect(suggest(['Batman', 'Spider-Man'], 'man')).toEqual(['Spider-Man', 'Batman']);
        });
    });

    describe('substring matches', () => {
        it('matches letters inside a single word', () => {
            expect(suggest(['The Godfather'], 'father')).toEqual(['The Godfather']);
            expect(suggest(['The Arrival'], 'he')).toEqual(['The Arrival']);
        });

        it('does not match letters that straddle two words', () => {
            // "thEARrival" would contain "ear" if spaces were ignored
            expect(suggest(['The Arrival'], 'ear')).toEqual([]);
        });

        it('returns nothing when no title matches', () => {
            expect(suggest(['Heat', 'The Godfather'], 'xyz')).toEqual([]);
        });
    });

    describe('ranking', () => {
        it('ranks exact, then title prefix, then word prefix, then anywhere', () => {
            expect(suggest(['The Godfather', 'The Help', 'Heat', 'He'], 'he')).toEqual([
                'He',
                'Heat',
                'The Help',
                'The Godfather',
            ]);
        });

        it('ranks an exact match above a title prefix despite punctuation', () => {
            expect(suggest(['Up the Creek', 'Up!'], 'up')).toEqual(['Up!', 'Up the Creek']);
        });

        it('ranks a title prefix above a word prefix even when longer', () => {
            expect(suggest(['The Heat', 'Heat Wave: Extended Cut'], 'heat')).toEqual([
                'Heat Wave: Extended Cut',
                'The Heat',
            ]);
        });

        it('ranks a word prefix above a substring even when longer', () => {
            expect(suggest(['Batman', 'The Amazing Spider-Man'], 'man')).toEqual([
                'The Amazing Spider-Man',
                'Batman',
            ]);
        });

        it('ranks shorter titles first within the same tier', () => {
            expect(suggest(['Hereditary', 'Heat', 'Her'], 'he')).toEqual(['Her', 'Heat', 'Hereditary']);
        });

        it('keeps movies with the same title in their original order', () => {
            const movies = [
                { id: 1, title: 'Dune', year: 1984 },
                { id: 2, title: 'Dune', year: 2021 },
            ];
            expect(findSuggestions(movies, 'dune').map((movie) => movie.id)).toEqual([1, 2]);
        });
    });

    describe('cap', () => {
        const manyTitles = Array.from({ length: 20 }, (_, i) => `The Movie ${i}`);

        it(`returns at most ${maxSuggestions} suggestions`, () => {
            expect(suggest(manyTitles, 'movie')).toHaveLength(maxSuggestions);
        });

        it('never drops an exact match, even when it comes last in the list', () => {
            const result = suggest([...manyTitles, 'He'], 'he');
            expect(result).toHaveLength(maxSuggestions);
            expect(result[0]).toBe('He');
        });
    });
});
