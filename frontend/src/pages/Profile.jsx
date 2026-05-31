import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('solved');

  useEffect(() => {
    Promise.all([
      api.get(`/users/${username}`),
    ]).then(([profileRes]) => {
      setProfile(profileRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [username]);

  const acceptanceRate = profile?.totalSubmissions > 0
    ? ((profile.solvedProblems?.length / profile.totalSubmissions) * 100).toFixed(1)
    : 0;

  const diffCount = (diff) =>
    (profile?.solvedProblems || []).filter(p => p.difficulty === diff).length;

  if (loading) return (
    <div className="page-wrapper loading-center"><div className="spinner spinner-lg" /></div>
  );

  if (!profile) return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="empty-state"><h3>User not found</h3></div>
      </div>
    </div>
  );

  return (
    <div className="profile-page page-wrapper">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar animate-fadeIn">
            <div className="profile-card card">
              <div className="profile-avatar-lg">
                {profile.username[0].toUpperCase()}
              </div>
              <h1 className="profile-username">{profile.username}</h1>
              <p className="profile-email">{profile.email}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <div className="profile-join">
                Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>

              <div className="divider" />

              <div className="profile-stats-grid">
                <div className="profile-stat">
                  <span className="profile-stat-value gradient-text">{profile.score || 0}</span>
                  <span className="profile-stat-label">Score</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value" style={{ color: 'var(--accent-green)' }}>
                    {profile.solvedProblems?.length || 0}
                  </span>
                  <span className="profile-stat-label">Solved</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value" style={{ color: 'var(--accent-blue)' }}>
                    {profile.totalSubmissions || 0}
                  </span>
                  <span className="profile-stat-label">Submissions</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value" style={{ color: 'var(--accent-purple)' }}>
                    {acceptanceRate}%
                  </span>
                  <span className="profile-stat-label">Acceptance</span>
                </div>
              </div>

              <div className="divider" />

              {/* Difficulty breakdown */}
              <div className="diff-breakdown">
                <div className="diff-row">
                  <span className="badge badge-easy">Easy</span>
                  <span className="diff-count">{diffCount('Easy')}</span>
                  <div className="diff-bar-bg">
                    <div className="diff-bar diff-bar-easy" style={{ width: `${Math.min(100, (diffCount('Easy') / Math.max(1, profile.solvedProblems?.length)) * 100)}%` }} />
                  </div>
                </div>
                <div className="diff-row">
                  <span className="badge badge-medium">Medium</span>
                  <span className="diff-count">{diffCount('Medium')}</span>
                  <div className="diff-bar-bg">
                    <div className="diff-bar diff-bar-medium" style={{ width: `${Math.min(100, (diffCount('Medium') / Math.max(1, profile.solvedProblems?.length)) * 100)}%` }} />
                  </div>
                </div>
                <div className="diff-row">
                  <span className="badge badge-hard">Hard</span>
                  <span className="diff-count">{diffCount('Hard')}</span>
                  <div className="diff-bar-bg">
                    <div className="diff-bar diff-bar-hard" style={{ width: `${Math.min(100, (diffCount('Hard') / Math.max(1, profile.solvedProblems?.length)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="profile-main animate-fadeIn">
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'solved' ? 'active' : ''}`} onClick={() => setActiveTab('solved')}>
                ✅ Solved Problems ({profile.solvedProblems?.length || 0})
              </button>
            </div>

            {activeTab === 'solved' && (
              <div>
                {profile.solvedProblems?.length === 0 ? (
                  <div className="empty-state">
                    <h3>No problems solved yet</h3>
                    <p>Start solving to see your progress here</p>
                    <Link to="/problems" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Problems</Link>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Problem</th>
                          <th>Difficulty</th>
                          <th className="hide-mobile">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.solvedProblems?.map((p, i) => (
                          <tr key={p._id}>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 13 }}>{i + 1}</td>
                            <td>
                              <Link to={`/problems/${p.slug}`} className="problem-link">✅ {p.title}</Link>
                            </td>
                            <td><span className={`badge badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></td>
                            <td className="hide-mobile">
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {(p.tags || []).slice(0, 2).map(t => <span key={t} className="badge badge-tag">{t}</span>)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
