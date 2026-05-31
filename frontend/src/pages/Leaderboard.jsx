import { useEffect, useState } from 'react';
import api from '../api/axios';
import './Leaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(res => { setUsers(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="leaderboard-page page-wrapper">
      <div className="container">
        <div className="lb-header animate-fadeIn">
          <div>
            <h1 className="lb-title">🏆 Leaderboard</h1>
            <p className="lb-subtitle">Top coders ranked by score and problems solved</p>
          </div>
        </div>

        {/* Podium */}
        {users.length >= 3 && (
          <div className="podium animate-fadeIn">
            {/* 2nd */}
            <div className="podium-item podium-2">
              <div className="podium-avatar">
                {users[1].username[0].toUpperCase()}
                <span className="podium-medal">🥈</span>
              </div>
              <div className="podium-name">{users[1].username}</div>
              <div className="podium-score">{users[1].score} pts</div>
              <div className="podium-bar podium-bar-2" />
            </div>
            {/* 1st */}
            <div className="podium-item podium-1">
              <div className="podium-avatar podium-avatar-gold">
                {users[0].username[0].toUpperCase()}
                <span className="podium-medal">🥇</span>
              </div>
              <div className="podium-name">{users[0].username}</div>
              <div className="podium-score gradient-text">{users[0].score} pts</div>
              <div className="podium-bar podium-bar-1" />
            </div>
            {/* 3rd */}
            <div className="podium-item podium-3">
              <div className="podium-avatar">
                {users[2].username[0].toUpperCase()}
                <span className="podium-medal">🥉</span>
              </div>
              <div className="podium-name">{users[2].username}</div>
              <div className="podium-score">{users[2].score} pts</div>
              <div className="podium-bar podium-bar-3" />
            </div>
          </div>
        )}

        {/* Full Table */}
        <div className="table-wrapper animate-fadeIn">
          {loading ? (
            <div className="loading-center"><div className="spinner spinner-lg" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Rank</th>
                  <th>User</th>
                  <th style={{ width: 120 }}>Score</th>
                  <th style={{ width: 120 }}>Solved</th>
                  <th style={{ width: 140 }} className="hide-mobile">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.username} className={i < 3 ? 'top-row' : ''}>
                    <td>
                      <span className={`rank-badge ${i < 3 ? `rank-${i + 1}` : ''}`}>
                        {i < 3 ? MEDALS[i] : `#${i + 1}`}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className={`user-avatar ${i === 0 ? 'avatar-gold' : i === 1 ? 'avatar-silver' : i === 2 ? 'avatar-bronze' : ''}`}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <a href={`/profile/${u.username}`} className="user-name">{u.username}</a>
                      </div>
                    </td>
                    <td>
                      <span className="score-value">{u.score}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> pts</span>
                    </td>
                    <td>
                      <span className="solved-value">{u.solved}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> problems</span>
                    </td>
                    <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
                      {u.totalSubmissions}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <h3>No users yet</h3>
                        <p>Be the first to register and solve problems!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
