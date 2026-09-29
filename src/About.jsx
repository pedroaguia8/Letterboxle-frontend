import { Link } from 'react-router-dom';
import './StaticPage.css';

// TODO: flesh out (project description, contact) — the TMDB attribution
// notice below is the one part that's legally required already.
function About() {
  return (
    <div className="static-page">
      <Link to="/" className="back-link">&larr; Back to the game</Link>
      <h1>About Letterboxle</h1>
      <p>This page is under construction. Full details coming soon.</p>
      <p>
        This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>
    </div>
  );
}

export default About;
