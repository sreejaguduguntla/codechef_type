import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const EMPTY_PROBLEM = {
  title: '', slug: '', difficulty: 'Easy', tags: '',
  description: '', inputFormat: '', outputFormat: '', constraints: '',
  timeLimit: 2, memoryLimit: 256,
  examples: [{ input: '', output: '', explanation: '' }],
  testCases: [{ input: '', expectedOutput: '', isSample: true }, { input: '', expectedOutput: '', isSample: false }],
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PROBLEM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [probRes, subRes] = await Promise.all([
        api.get('/problems?limit=50'),
        api.get('/submissions/all'),
      ]);
      setProblems(probRes.data.problems || []);
      setSubmissions(subRes.data || []);
    } catch (e) {}
    setLoading(false);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
      };
      await api.post('/problems', payload);
      setMessage('✅ Problem created successfully!');
      setShowForm(false);
      setForm(EMPTY_PROBLEM);
      loadData();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to save'));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    await api.delete(`/problems/${id}`);
    loadData();
  };

  const updateExample = (i, field, val) => {
    const ex = [...form.examples];
    ex[i] = { ...ex[i], [field]: val };
    setForm({ ...form, examples: ex });
  };

  const updateTestCase = (i, field, val) => {
    const tc = [...form.testCases];
    tc[i] = { ...tc[i], [field]: val };
    setForm({ ...form, testCases: tc });
  };

  const verdictColor = (v) => {
    if (v === 'Accepted') return 'var(--accent-green)';
    if (v === 'Wrong Answer') return 'var(--accent-red)';
    if (v === 'Compilation Error') return 'var(--accent-purple)';
    return 'var(--accent-yellow)';
  };

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        <div className="admin-header animate-fadeIn">
          <div>
            <h1 className="admin-title">⚙️ Admin Panel</h1>
            <p className="admin-subtitle">Manage problems and submissions</p>
          </div>
          {activeTab === 'problems' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Problem'}
            </button>
          )}
        </div>

        {message && (
          <div className={`admin-message ${message.startsWith('✅') ? 'msg-success' : 'msg-error'}`}>
            {message}
            <button onClick={() => setMessage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </div>
        )}

        {/* Add Problem Form */}
        {showForm && (
          <div className="problem-form card animate-scaleIn">
            <h2 style={{ marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Create New Problem</h2>
            <form onSubmit={handleSaveProblem}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Two Sum" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input className="form-input" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="two-sum" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Difficulty *</label>
                  <select className="form-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Array, Hash Table" />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Limit (s)</label>
                  <input className="form-input" type="number" value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Problem Description *</label>
                <textarea className="form-textarea" required rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the problem..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Input Format</label>
                  <textarea className="form-textarea" rows={2} value={form.inputFormat} onChange={e => setForm({ ...form, inputFormat: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Output Format</label>
                  <textarea className="form-textarea" rows={2} value={form.outputFormat} onChange={e => setForm({ ...form, outputFormat: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Constraints</label>
                <textarea className="form-textarea" rows={2} value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })} />
              </div>

              <div className="form-section-header">
                <h3>Examples</h3>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] })}>+ Add</button>
              </div>
              {form.examples.map((ex, i) => (
                <div key={i} className="tc-block">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Input {i + 1}</label>
                      <textarea className="form-textarea" rows={2} value={ex.input} onChange={e => updateExample(i, 'input', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Output {i + 1}</label>
                      <textarea className="form-textarea" rows={2} value={ex.output} onChange={e => updateExample(i, 'output', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Explanation (optional)</label>
                    <input className="form-input" value={ex.explanation} onChange={e => updateExample(i, 'explanation', e.target.value)} />
                  </div>
                </div>
              ))}

              <div className="form-section-header">
                <h3>Test Cases</h3>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm({ ...form, testCases: [...form.testCases, { input: '', expectedOutput: '', isSample: false }] })}>+ Add</button>
              </div>
              {form.testCases.map((tc, i) => (
                <div key={i} className="tc-block">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Input {i + 1}</label>
                      <textarea className="form-textarea" rows={2} value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expected Output {i + 1}</label>
                      <textarea className="form-textarea" rows={2} value={tc.expectedOutput} onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={tc.isSample} onChange={e => updateTestCase(i, 'isSample', e.target.checked)} />
                    Show as sample (visible to users)
                  </label>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" className="btn btn-success" disabled={saving}>
                  {saving ? <><div className="spinner" /> Saving...</> : '✓ Create Problem'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_PROBLEM); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>
            🧩 Problems ({problems.length})
          </button>
          <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
            📊 Submissions ({submissions.length})
          </button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : activeTab === 'problems' ? (
          <div className="table-wrapper animate-fadeIn">
            <table>
              <thead>
                <tr><th>Title</th><th>Difficulty</th><th>Tests</th><th>Submitted</th><th>Accepted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {problems.map(p => (
                  <tr key={p._id}>
                    <td><Link to={`/problems/${p.slug}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</Link></td>
                    <td><span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-muted)' }}>{p.testCases?.length || 0}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>{p.totalSubmissions}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--accent-green)' }}>{p.acceptedSubmissions}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper animate-fadeIn">
            <table>
              <thead>
                <tr><th>Time</th><th>User</th><th>Problem</th><th>Language</th><th>Verdict</th><th>Runtime</th></tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{s.user?.username}</td>
                    <td><Link to={`/problems/${s.problem?.slug}`} style={{ color: 'var(--accent-blue)' }}>{s.problem?.title}</Link></td>
                    <td><span className="badge badge-tag">{s.language}</span></td>
                    <td><span style={{ color: verdictColor(s.verdict), fontWeight: 700, fontSize: 13 }}>{s.verdict}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-muted)' }}>
                      {s.runtime !== null ? `${s.runtime}ms` : '—'}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan="6"><div className="empty-state"><h3>No submissions yet</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
