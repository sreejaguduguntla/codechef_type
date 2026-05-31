import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:slug" element={<ProblemDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={
                <div className="page-wrapper">
                  <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
                    <div style={{ fontSize: 80, marginBottom: 16 }}>🔍</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12 }}>404</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Page not found</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
