import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, NavLink } from 'react-router-dom'
import FormPage from './components/FormPage'
import ResultPage from './components/ResultPage'
import HomePage from './components/HomePage'

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialLoad = useRef(true);

  useEffect(() => {
    // If it's the very first time the app is mounting (on reload/load)
    // and we aren't already at the root, force navigate to home.
    if (initialLoad.current) {
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      initialLoad.current = false;
    }
  }, [navigate, location.pathname]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand"><Link to="/" style={{color: 'inherit', textDecoration: 'none'}}>Skin Cancer AI</Link></div>
        <ul className="navbar-nav">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><a href="/#info">Info</a></li>
          <li><NavLink to="/tool">Tools</NavLink></li>
          <li><a href="/#approach">Our Solution</a></li>
          <li><a href="/#about">Meet Our Team</a></li>
        </ul>
      </nav>
      
      <main style={{width: '100%'}}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tool" element={<div className="container"><FormPage /></div>} />
          <Route path="/result" element={<div className="container"><ResultPage /></div>} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
