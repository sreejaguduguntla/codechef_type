import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ProblemDetail.css';

const LANGUAGES = [
  { id: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { id: 'python', label: 'Python 3', monacoLang: 'python' },
  { id: 'java', label: 'Java', monacoLang: 'java' },
  { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { id: 'c', label: 'C', monacoLang: 'c' },
];

const DEFAULT_CODE = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
  python: `import sys
input = sys.stdin.readline

def main():
    # Your code here
    pass

main()`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line.trim()));
rl.on('close', () => {
    // Your code here
});`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your code here
    return 0;
}`,
};

const VerdictBadge = ({ verdict }) => {
  const map = {
    'Accepted': { emoji: '✅', class: 'verdict-accepted' },
    'Wrong Answer': { emoji: '❌', class: 'verdict-wrong' },
    'Time Limit Exceeded': { emoji: '⏱', class: 'verdict-tle' },
    'Compilation Error': { emoji: '🛑', class: 'verdict-ce' },
    'Runtime Error': { emoji: '💥', class: 'verdict-re' },
    'Pending': { emoji: '⏳', class: 'verdict-pending' },
    'Memory Limit Exceeded': { emoji: '💾', class: 'verdict-tle' },
  };
  const v = map[verdict] || { emoji: '❓', class: 'verdict-pending' };
  return (
    <span className={`verdict-badge ${v.class}`}>
      {v.emoji} {verdict}
    </span>
  );
};

export default function ProblemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_CODE['cpp']);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    api.get(`/problems/${slug}`)
      .then(res => { setProblem(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
  };

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.post('/submissions', {
        problemId: problem._id,
        language,
        code,
      });
      setResult(data);
    } catch (err) {
      setResult({ verdict: 'Internal Error', errorOutput: err.response?.data?.message || 'Server error' });
    }
    setSubmitting(false);
  };

  const loadSubmissions = async () => {
    if (!user) return;
    setSubsLoading(true);
    try {
      const { data } = await api.get(`/submissions/me?problemId=${problem._id}`);
      setSubmissions(data);
    } catch (e) {}
    setSubsLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'submissions' && problem) loadSubmissions();
  };

  if (loading) return (
    <div className="page-wrapper loading-center"><div className="spinner spinner-lg" /></div>
  );

  if (!problem) return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="empty-state">
          <h3>Problem not found</h3>
          <p><Link to="/problems">← Back to Problems</Link></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="problem-detail-page page-wrapper">
      <div className="problem-layout">
        {/* Left Panel */}
        <div className="problem-left">
          {/* Problem Header */}
          <div className="problem-header">
            <Link to="/problems" className="back-link">← Problems</Link>
            <div className="problem-meta">
              <h1 className="problem-title">{problem.title}</h1>
              <div className="problem-info">
                <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>⏱ {problem.timeLimit}s</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>💾 {problem.memoryLimit}MB</span>
                {problem.totalSubmissions > 0 && (
                  <span style={{ color: 'var(--accent-green)', fontSize: 13 }}>
                    ✓ {((problem.acceptedSubmissions / problem.totalSubmissions) * 100).toFixed(1)}% acceptance
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {(problem.tags || []).map(t => <span key={t} className="badge badge-tag">{t}</span>)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => handleTabChange('problem')}>📄 Problem</button>
            <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => handleTabChange('submissions')}>📊 My Submissions</button>
          </div>

          {activeTab === 'problem' && (
            <div className="problem-body animate-fadeIn">
              <div className="problem-description" dangerouslySetInnerHTML={{ __html: markdownToHtml(problem.description) }} />

              {problem.inputFormat && (
                <div className="problem-section">
                  <h3>Input Format</h3>
                  <p>{problem.inputFormat}</p>
                </div>
              )}

              {problem.outputFormat && (
                <div className="problem-section">
                  <h3>Output Format</h3>
                  <p>{problem.outputFormat}</p>
                </div>
              )}

              {problem.constraints && (
                <div className="problem-section">
                  <h3>Constraints</h3>
                  <div className="code-block"><code>{problem.constraints}</code></div>
                </div>
              )}

              {problem.examples?.map((ex, i) => (
                <div key={i} className="example-block">
                  <h3>Example {i + 1}</h3>
                  <div className="example-io">
                    <div className="example-box">
                      <div className="example-label">Input</div>
                      <pre className="example-content">{ex.input}</pre>
                    </div>
                    <div className="example-box">
                      <div className="example-label">Output</div>
                      <pre className="example-content">{ex.output}</pre>
                    </div>
                  </div>
                  {ex.explanation && (
                    <div className="example-explanation">
                      <strong>Explanation:</strong> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="animate-fadeIn">
              {!user ? (
                <div className="empty-state">
                  <h3>Login to see your submissions</h3>
                  <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Login</Link>
                </div>
              ) : subsLoading ? (
                <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
              ) : submissions.length === 0 ? (
                <div className="empty-state">
                  <h3>No submissions yet</h3>
                  <p>Submit your solution to see it here</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Time</th><th>Language</th><th>Verdict</th><th>Runtime</th></tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => (
                        <tr key={s._id}>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleString()}</td>
                          <td><span className="badge badge-tag">{s.language}</span></td>
                          <td><VerdictBadge verdict={s.verdict} /></td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-secondary)' }}>
                            {s.runtime !== null ? `${s.runtime}ms` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="problem-right">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="lang-selector">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  className={`lang-btn ${language === l.id ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.id === language)?.monacoLang || 'cpp'}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 4,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* Submit Area */}
          <div className="submit-area">
            <button
              className="btn btn-success btn-lg submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
              id="submit-code-btn"
            >
              {submitting ? (
                <><div className="spinner" /> Judging...</>
              ) : (
                '▶ Submit Code'
              )}
            </button>

            {result && (
              <div className={`result-panel animate-scaleIn ${result.verdict === 'Accepted' ? 'result-accepted' : 'result-failed'}`}>
                <div className="result-header">
                  <VerdictBadge verdict={result.verdict} />
                  {result.testCasesPassed !== undefined && (
                    <span className="result-cases">
                      {result.testCasesPassed}/{result.totalTestCases} test cases
                    </span>
                  )}
                </div>
                {result.runtime !== null && result.runtime !== undefined && (
                  <div className="result-stats">
                    <span>⏱ {result.runtime}ms</span>
                    {result.memory && <span>💾 {(result.memory / 1024).toFixed(1)}MB</span>}
                  </div>
                )}
                {result.errorOutput && (
                  <pre className="error-output">{result.errorOutput}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple markdown-to-HTML for problem descriptions
function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;font-family:JetBrains Mono;font-size:13px">$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
