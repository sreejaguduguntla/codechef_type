import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Problems.css';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;
      const { data } = await api.get('/problems', { params });
      setProblems(data.problems);
      setTotal(data.total);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchProblems(); }, [page, difficulty, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDifficulty = (d) => {
    setDifficulty(d === 'All' ? '' : d);
    setPage(1);
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="problems-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="problems-header animate-fadeIn">
          <div>
            <h1 className="problems-title">Problem Set</h1>
            <p className="problems-subtitle">{total} problems available</p>
          </div>
        </div>

        {/* Filters */}
        <div className="problems-filters animate-fadeIn">
          <div className="difficulty-filters">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`diff-btn ${(difficulty === '' && d === 'All') || difficulty === d ? 'active' : ''} ${d !== 'All' ? `diff-${d.toLowerCase()}` : ''}`}
                onClick={() => handleDifficulty(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              className="form-input search-input"
              type="text"
              placeholder="Search problems..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
        </div>

        {/* Table */}
        <div className="table-wrapper animate-fadeIn">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Title</th>
                <th style={{ width: 110 }}>Difficulty</th>
                <th className="hide-mobile">Tags</th>
                <th style={{ width: 110 }}>Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="loading-center" style={{ minHeight: 200 }}>
                      <div className="spinner spinner-lg" />
                    </div>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <h3>No problems found</h3>
                      <p>Try changing your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : (
                problems.map((p, i) => {
                  const acceptance = p.totalSubmissions > 0
                    ? ((p.acceptedSubmissions / p.totalSubmissions) * 100).toFixed(1)
                    : null;
                  return (
                    <tr key={p._id} className="problem-row">
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
                        {(page - 1) * 15 + i + 1}
                      </td>
                      <td>
                        <Link to={`/problems/${p.slug}`} className="problem-link">
                          {p.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                      </td>
                      <td className="hide-mobile">
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {(p.tags || []).slice(0, 3).map(t => (
                            <span key={t} className="badge badge-tag">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {acceptance ? (
                          <span style={{
                            color: parseFloat(acceptance) > 50 ? 'var(--accent-green)' : parseFloat(acceptance) > 30 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                            fontWeight: 600,
                            fontFamily: 'JetBrains Mono',
                            fontSize: 13,
                          }}>
                            {acceptance}%
                          </span>
                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
