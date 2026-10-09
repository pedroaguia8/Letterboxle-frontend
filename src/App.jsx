import { Routes, Route } from 'react-router-dom';
import Game from './Game';
import Privacy from './Privacy';
import About from './About';
import NotFound from './NotFound';
import Footer from './Footer';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App
