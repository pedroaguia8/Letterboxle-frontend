import { Link } from 'react-router-dom';
import './StaticPage.css';

function NotFound() {
  return (
    <div className="static-page">
      <h1>Page not found</h1>
      <p>There's nothing at this address.</p>
      <p>
        <Link to="/">Go to today's movie</Link>
      </p>
    </div>
  );
}

export default NotFound;
