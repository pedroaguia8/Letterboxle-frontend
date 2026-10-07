import { Link } from 'react-router-dom';
import tmdbLogo from './assets/tmdb-logo.svg';
import './StaticPage.css';

function About() {
  return (
    <div className="static-page">
      <Link to="/" className="back-link">&larr; Back to the game</Link>
      <h1>About Letterboxle</h1>
      <p>
        Letterboxle is a daily movie-guessing game. There's one movie a day,
        and you get six tries to guess it. You start with its tagline, and
        each wrong guess or skip reveals another hint: the genres, the
        director, two of the lead actors and, last of all, the release year.
      </p>
      <p>A new movie comes out every day at midnight UTC.</p>

      <h2>Movie data</h2>
      <p>
        Movie titles, details and posters come from The Movie Database
        (TMDB).
      </p>
      <div className="tmdb-credit">
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
          <img src={tmdbLogo} alt="The Movie Database (TMDB)" />
        </a>
      </div>
      <p>
        This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, bugs or a movie you think shouldn't be in the game? Write
        to{' '}
        <a href="mailto:contact@letterboxle.pedroaguia8.dev">
          contact@letterboxle.pedroaguia8.dev
        </a>
        .
      </p>
    </div>
  );
}

export default About;
