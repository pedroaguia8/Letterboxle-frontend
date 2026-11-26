import { Link } from 'react-router-dom';
import './StaticPage.css';

// TODO: replace with the full GDPR-complete version (controller identity,
// legal basis, international-transfer disclosure, data-subject rights,
// breach-notification note) — see the T0.6 plan. When it's written, add
// /privacy to public/sitemap.xml (left out while it's a placeholder).
function Privacy() {
  return (
    <div className="static-page">
      <link rel="canonical" href="https://letterboxle.pedroaguia8.dev/privacy" />
      <Link to="/" className="back-link">&larr; Back to the game</Link>
      <h1>Privacy Policy</h1>
      <p>This page is under construction. Full details coming soon.</p>
    </div>
  );
}

export default Privacy;
