import { Link } from 'react-router-dom';
import './StaticPage.css';

function NotFound() {
  return (
    <div className="static-page">
      {/* The server answers every path with the app and a 200, so this tells
          search engines not to index unknown URLs (React hoists it into <head>). */}
      <meta name="robots" content="noindex" />
      <h1>Page not found</h1>
      <p>There's nothing at this address.</p>
      <p>
        <Link to="/">Go to today's movie</Link>
      </p>
    </div>
  );
}

export default NotFound;
