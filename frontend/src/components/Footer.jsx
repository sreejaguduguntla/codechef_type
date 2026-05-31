import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '32px 0',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
            Code<span style={{ color: 'var(--accent-blue)' }}>Arena</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Sharpen your skills, one problem at a time.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/problems" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            Problems
          </Link>
          <Link to="/leaderboard" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            Leaderboard
          </Link>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2025 CodeArena
        </div>
      </div>
    </footer>
  );
}
