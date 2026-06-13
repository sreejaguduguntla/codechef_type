import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const STATS = [
  { label: 'Problems', icon: '🧩', color: 'var(--accent-blue)' },
  { label: 'Users', icon: '👥', color: 'var(--accent-green)' },
  { label: 'Submissions', icon: '🚀', color: 'var(--accent-purple)' },
];

const FEATURES = [
  { icon: '⚡', title: 'Real-time Judge', desc: 'Submit code and get instant verdicts powered by Judge0 CE' },
  { icon: '🌐', title: 'Multi-language', desc: 'C++, Python, Java, JavaScript — code in your favorite language' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Compete with others and climb the global rankings' },
  { icon: '📊', title: 'Analytics', desc: 'Track your progress with detailed submission history' },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ problems: 0, users: 0, submissions: 0 });
  const [recentProblems, setRecentProblems] = useState([]);

  useEffect(() => {
    api.get('/problems?limit=5').then(res => {
      setRecentProblems(res.data.problems || []);
      setStats(s => ({ ...s, problems: res.data.total || 0 }));
    }).catch(() => {});
    api.get('/users/leaderboard').then(res => {
      setStats(s => ({ ...s, users: res.data.length || 0 }));
    }).catch(() => {});
  }, []);

  return (
    <div className="home-page page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="grid-overlay" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge badge-primary">🏅 Beta v1.0</span>
          </div>
          <h1 className="hero-title">
            Master Algorithms.<br />
            <span className="gradient-text">Code. Submit. Win.</span>
          </h1>
          <p className="hero-subtitle">
            Challenge yourself with curated algorithmic problems, get instant feedback,
            and compete on the global leaderboard.
          </p>
          <div className="hero-actions">
            <Link to="/problems" className="btn btn-primary btn-xl">
              Start Solving →
            </Link>
            {user ? (
              <Link to="/leaderboard" className="btn btn-outline btn-xl">
                Leaderboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-outline btn-xl">
                Join Free
              </Link>
            )}
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{stats.problems}+</span>
              <span className="hero-stat-label">Problems</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">5</span>
              <span className="hero-stat-label">Languages</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">∞</span>
              <span className="hero-stat-label">Possibilities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-center-title">Why <span className="gradient-text">CodeArena</span>?</h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Problems */}
      <section className="recent-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Problems</h2>
            <Link to="/problems" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th>Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {recentProblems.map((p, i) => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <Link to={`/problems/${p.slug}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                        {p.title}
                      </Link>
                    </td>
                    <td><span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(p.tags || []).slice(0, 2).map(t => (
                          <span key={t} className="badge badge-tag">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                      {p.totalSubmissions > 0
                        ? `${((p.acceptedSubmissions / p.totalSubmissions) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
                {recentProblems.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading problems...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-blob" />
            <h2 className="cta-title">Ready to level up your coding?</h2>
            <p className="cta-subtitle">Join thousands of programmers and start solving today.</p>
            {user ? (
              <Link to="/problems" className="btn btn-success btn-xl">Go to Problems</Link>
            ) : (
              <Link to="/register" className="btn btn-success btn-xl">Get Started Free</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
